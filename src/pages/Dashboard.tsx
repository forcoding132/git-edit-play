import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  User,
  Trophy,
  AlertCircle,
  Plus,
  Activity,
  History
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { PaymentModal } from "@/components/PaymentModal";
import { TradingChart } from "@/components/TradingChart";
import { AccountHistory } from "@/components/AccountHistory";
import { NotificationSystem } from "@/components/NotificationSystem";

interface TradingPlan {
  id: string;
  name: string;
  price: number;
  account_size: number;
  profit_target: number;
  max_drawdown: number;
}

interface UserChallenge {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  current_balance: number;
  highest_balance: number;
  total_profit: number;
  trading_days: number;
  trading_plans: {
    name: string;
    account_size: number;
    profit_target: number;
    max_drawdown: number;
  };
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [tradingPlans, setTradingPlans] = useState<TradingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TradingPlan | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch challenges
        const { data: challengesData, error: challengesError } = await supabase
          .from('user_challenges')
          .select(`
            *,
            trading_plans (
              name,
              account_size,
              profit_target,
              max_drawdown
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (challengesError) {
          console.error('Challenges fetch error:', challengesError);
        } else {
          setChallenges(challengesData || []);
        }

        // Fetch available trading plans
        const { data: plansData, error: plansError } = await supabase
          .from('trading_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (plansError) {
          console.error('Plans fetch error:', plansError);
        } else {
          setTradingPlans(plansData || []);
        }
      } catch (error) {
        console.error('Data fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id, toast]);

  const handlePurchasePlan = (plan: TradingPlan) => {
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'passed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'funded': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/src/assets/nova-logo.png" alt="Nova Funded Traders" className="h-8 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nova Funded Traders
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <NotificationSystem userId={user?.id || ''} />
              <span className="text-muted-foreground">
                Welcome, {profile?.first_name || "Trader"}!
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.first_name || "Trader"}!
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your trading activities and current challenges.
            </p>
          </motion.div>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trading">Live Trading</TabsTrigger>
              <TabsTrigger value="purchase">Purchase Plans</TabsTrigger>
              <TabsTrigger value="history">Account History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">

        {challenges.length === 0 ? (
          /* No Challenges State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Start Your Trading Journey</h2>
              <p className="text-muted-foreground mb-8">
                You haven't started any challenges yet. Choose a trading plan that matches your experience and goals.
              </p>
              <Link to="/plans">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  Browse Trading Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Active Challenges */
          <>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {challenges.filter(c => c.status === 'active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(challenges.reduce((sum, c) => sum + (c.total_profit || 0), 0))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Passed Challenges</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {challenges.filter(c => c.status === 'passed' || c.status === 'funded').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trading Days</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {challenges.reduce((sum, c) => sum + (c.trading_days || 0), 0)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trading Tab */}
            <TabsContent value="trading" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TradingChart symbol="BTCUSDT" height={500} />
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Market Watchlist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT'].map((symbol) => (
                        <div key={symbol} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <span className="font-medium">{symbol.replace('USDT', '/USDT')}</span>
                          <Badge variant="outline">+2.34%</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trading Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Always use proper risk management</p>
                        <p>• Never risk more than 2% per trade</p>
                        <p>• Keep a trading journal</p>
                        <p>• Follow your trading plan</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Purchase Plans Tab */}
            <TabsContent value="purchase" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose Your Trading Plan</h2>
                <p className="text-muted-foreground">
                  Select the account size that matches your trading experience and risk tolerance.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradingPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="relative overflow-hidden border-2 hover:border-primary/20 transition-colors">
                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[50px] border-b-[50px] border-l-transparent border-b-primary/10"></div>
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="space-y-2">
                          <div className="text-3xl font-bold text-primary">
                            ${plan.price.toLocaleString()}
                          </div>
                          <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                            ${plan.account_size.toLocaleString()} Account
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Profit Target:</span>
                            <span className="font-semibold">{plan.profit_target}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Drawdown:</span>
                            <span className="font-semibold">{plan.max_drawdown}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment:</span>
                            <span className="font-semibold text-green-600">USDT TRC20</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handlePurchasePlan(plan)}
                          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Purchase Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              {user?.id && <AccountHistory userId={user.id} />}
            </TabsContent>
          </Tabs>
          </>
        )}

        </main>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          plan={selectedPlan}
          userId={user?.id || ''}
        />
      </div>
    );
  };

  export default Dashboard;