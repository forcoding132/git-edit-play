import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  QrCode,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    account_size: number;
  } | null;
  userId: string;
}

export const PaymentModal = ({ isOpen, onClose, plan, userId }: PaymentModalProps) => {
  const [step, setStep] = useState<'loading' | 'payment' | 'verification' | 'success'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && plan && userId) {
      generatePayment();
    }
  }, [isOpen, plan, userId]);

  const generatePayment = async () => {
    try {
      setStep('loading');
      
      const { data, error } = await supabase.functions.invoke('generate-payment', {
        body: {
          user_id: userId,
          plan_id: plan?.id
        }
      });

      if (error) throw error;

      setPaymentData(data);
      
      // Generate QR code for the payment
      const paymentUrl = `tron:${data.wallet_address}?amount=${data.amount}&token=USDT&memo=${encodeURIComponent(data.memo)}`;
      const qrUrl = await QRCode.toDataURL(paymentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setQrCodeUrl(qrUrl);
      setStep('payment');
      
    } catch (error) {
      console.error('Payment generation error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to generate payment. Please try again.",
        variant: "destructive",
      });
      onClose();
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const verifyPayment = async () => {
    if (!transactionHash.trim()) {
      toast({
        title: "Transaction Hash Required",
        description: "Please enter the transaction hash from your wallet",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          payment_id: paymentData.payment_id,
          transaction_hash: transactionHash
        }
      });

      if (error) throw error;

      if (data.success) {
        setStep('success');
        toast({
          title: "Payment Verified!",
          description: "Your trading challenge has been activated.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Payment could not be verified. Please check the transaction hash.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify payment. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('loading');
    setPaymentData(null);
    setQrCodeUrl('');
    setTransactionHash('');
    setVerifying(false);
    onClose();
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Purchase {plan.name}
          </DialogTitle>
        </DialogHeader>

        {step === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Generating payment...</span>
          </div>
        )}

        {step === 'payment' && paymentData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Send exactly <strong>{paymentData.amount} USDT (TRC20)</strong> to the address below.
                Make sure to use the TRON network (TRC20).
              </AlertDescription>
            </Alert>

            {qrCodeUrl && (
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="mx-auto border rounded-lg p-2 bg-white"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Scan with your TRON wallet
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={paymentData.wallet_address}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData.wallet_address, "Wallet address")}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-mono">
                      {paymentData.amount} USDT
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Network</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      TRON (TRC20)
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Memo (Optional but recommended)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={paymentData.memo}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData.memo, "Memo")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                After sending the payment, enter your transaction hash below to verify the payment.
                You can find this in your wallet's transaction history.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="tx-hash" className="text-sm font-medium">
                Transaction Hash
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="tx-hash"
                  placeholder="Enter transaction hash from your wallet"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                />
                <Button
                  onClick={verifyPayment}
                  disabled={verifying || !transactionHash.trim()}
                  className="min-w-[100px]"
                >
                  {verifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('verification')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Manual Verification
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'verification' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                If automatic verification doesn't work, our team will manually verify your payment within 1-2 hours.
                Please save your transaction hash for reference.
              </AlertDescription>
            </Alert>

            <div className="text-center py-4">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Payment Pending Verification</h3>
              <p className="text-sm text-muted-foreground">
                Your payment is being processed. You'll receive an email confirmation once verified.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Payment Confirmed!</h3>
              <p className="text-muted-foreground">
                Your {plan.name} challenge has been activated. You can now start trading!
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Go to Dashboard
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};