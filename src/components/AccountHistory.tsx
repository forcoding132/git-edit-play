import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  transaction_hash: string | null;
  trading_plans: {
    name: string;
    account_size: number;
  };
}

interface Challenge {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  current_balance: number;
  total_profit: number;
  trading_days: number;
  created_at: string;
  trading_plans: {
    name: string;
    account_size: number;
    profit_target: number;
  };
}

interface TradingRecord {
  id: string;
  trade_date: string;
  profit_loss: number;
  balance_after: number;
  created_at: string;
  user_challenges: {
    trading_plans: {
      name: string;
    };
  };
}

interface AccountHistoryProps {
  userId: string;
}

export const AccountHistory = ({ userId }: AccountHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [tradingHistory, setTradingHistory] = useState<TradingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccountHistory();
  }, [userId]);

  const fetchAccountHistory = async () => {
    try {
      setLoading(true);

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          trading_plans (
            name,
            account_size
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Payments fetch error:', paymentsError);
      } else {
        setPayments(paymentsData || []);
      }

      // Fetch challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          trading_plans (
            name,
            account_size,
            profit_target
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (challengesError) {
        console.error('Challenges fetch error:', challengesError);
      } else {
        setChallenges(challengesData || []);
      }

      // Fetch trading history
      const { data: tradingData, error: tradingError } = await supabase
        .from('trading_history')
        .select(`
          *,
          user_challenges!inner (
            user_id,
            trading_plans (
              name
            )
          )
        `)
        .eq('user_challenges.user_id', userId)
        .order('trade_date', { ascending: false })
        .limit(50);

      if (tradingError) {
        console.error('Trading history fetch error:', tradingError);
      } else {
        setTradingHistory(tradingData || []);
      }

    } catch (error) {
      console.error('Account history fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load account history. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'passed':
      case 'funded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'passed':
      case 'funded':
        return 'bg-green-500';
      case 'pending':
      case 'active':
        return 'bg-yellow-500';
      case 'failed':
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Account History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="trading">Trading History</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payments found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <div className="font-medium">
                            {payment.trading_plans.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(payment.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </div>
                        <Badge className={`${getStatusColor(payment.status)} text-white text-xs`}>
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {payment.transaction_hash && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          TX: {payment.transaction_hash.substring(0, 20)}...
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No challenges found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(challenge.status)}
                        <div>
                          <div className="font-medium">
                            {challenge.trading_plans.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Started {formatDate(challenge.start_date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(challenge.current_balance || challenge.trading_plans.account_size)}
                        </div>
                        <Badge className={`${getStatusColor(challenge.status)} text-white text-xs`}>
                          {challenge.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <div className="text-muted-foreground">P&L</div>
                        <div className={`font-semibold ${
                          (challenge.total_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(challenge.total_profit || 0)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <div className="text-muted-foreground">Trading Days</div>
                        <div className="font-semibold">{challenge.trading_days || 0}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/20 rounded">
                        <div className="text-muted-foreground">Target</div>
                        <div className="font-semibold">{challenge.trading_plans.profit_target}%</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trading" className="space-y-4">
            {tradingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trading history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tradingHistory.map((trade) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {trade.profit_loss >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            {trade.user_challenges.trading_plans.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(trade.trade_date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          trade.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.profit_loss >= 0 ? '+' : ''}{formatCurrency(trade.profit_loss)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Balance: {formatCurrency(trade.balance_after)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};