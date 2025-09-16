import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const tronApiKey = Deno.env.get('TRON_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// USDT TRC20 contract address
const USDT_CONTRACT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id, transaction_hash } = await req.json();

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing payment_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      console.error('Payment fetch error:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If transaction hash is provided, verify it on blockchain
    if (transaction_hash) {
      try {
        const tronGridUrl = tronApiKey 
          ? `https://api.trongrid.io/v1/transactions/${transaction_hash}`
          : `https://apilist.tronscan.org/api/transaction-info?hash=${transaction_hash}`;

        const headers = tronApiKey 
          ? { 'TRON-PRO-API-KEY': tronApiKey }
          : {};

        const response = await fetch(tronGridUrl, { headers });
        const txData = await response.json();

        console.log('Transaction data:', JSON.stringify(txData, null, 2));

        let isValidPayment = false;
        let actualAmount = 0;

        if (tronApiKey && txData.ret && txData.ret[0] && txData.ret[0].contractRet === 'SUCCESS') {
          // TronGrid API response format
          const contract = txData.raw_data.contract[0];
          if (contract.type === 'TriggerSmartContract') {
            const parameter = contract.parameter.value;
            if (parameter.contract_address && 
                parameter.contract_address.toLowerCase() === USDT_CONTRACT_ADDRESS.toLowerCase()) {
              
              // Decode transfer data to get amount and recipient
              const data = parameter.data;
              if (data && data.length >= 136) {
                const toAddress = '41' + data.substring(32, 72);
                const amountHex = data.substring(72, 136);
                actualAmount = parseInt(amountHex, 16) / 1000000; // USDT has 6 decimals
                
                // Convert address format and check if it matches our wallet
                if (toAddress && actualAmount >= payment.amount) {
                  isValidPayment = true;
                }
              }
            }
          }
        } else if (!tronApiKey && txData.contractRet === 'SUCCESS') {
          // TronScan API response format (fallback)
          if (txData.trigger_info && txData.trigger_info.contract_address === USDT_CONTRACT_ADDRESS) {
            const transfers = txData.trc20TransferInfo || [];
            for (const transfer of transfers) {
              if (transfer.to_address === payment.wallet_address) {
                actualAmount = parseFloat(transfer.amount_str) / Math.pow(10, transfer.decimals);
                if (actualAmount >= payment.amount) {
                  isValidPayment = true;
                  break;
                }
              }
            }
          }
        }

        if (isValidPayment) {
          // Update payment status
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: 'confirmed',
              transaction_hash,
              confirmed_at: new Date().toISOString()
            })
            .eq('id', payment_id);

          if (updateError) {
            console.error('Payment update error:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update payment' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Create user challenge
          const { error: challengeError } = await supabase
            .from('user_challenges')
            .insert({
              user_id: payment.user_id,
              plan_id: payment.plan_id,
              status: 'active',
              start_date: new Date().toISOString(),
              current_balance: 0, // Will be set based on plan
              highest_balance: 0,
              total_profit: 0,
              trading_days: 0
            });

          if (challengeError) {
            console.error('Challenge creation error:', challengeError);
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Payment verified and challenge created',
              amount_paid: actualAmount
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Payment verification failed',
              details: 'Transaction not found or invalid amount'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      } catch (blockchainError) {
        console.error('Blockchain verification error:', blockchainError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to verify on blockchain',
            details: blockchainError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If no transaction hash provided, just return payment status
    return new Response(
      JSON.stringify({
        payment_id: payment.id,
        status: payment.status,
        amount: payment.amount,
        wallet_address: payment.wallet_address
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});