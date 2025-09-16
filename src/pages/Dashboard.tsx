import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

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
  const [loading, setLoading] = useState(true);
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

            {/* Challenge Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Your Challenges</h2>
              
              <div className="grid gap-6">
                {challenges.map((challenge) => {
                  const profitPercentage = challenge.trading_plans.account_size > 0 
                    ? ((challenge.total_profit || 0) / challenge.trading_plans.account_size) * 100
                    : 0;
                  
                  const targetReached = profitPercentage >= challenge.trading_plans.profit_target;

                  return (
                    <Card key={challenge.id} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {challenge.trading_plans.name}
                              <Badge className={`${getStatusColor(challenge.status)} text-white`}>
                                {challenge.status.toUpperCase()}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              Account Size: {formatCurrency(challenge.trading_plans.account_size)}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {formatCurrency(challenge.current_balance || challenge.trading_plans.account_size)}
                            </div>
                            <div className="text-sm text-muted-foreground">Current Balance</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Profit Target Progress</span>
                            <span className={targetReached ? 'text-green-500 font-semibold' : ''}>
                              {profitPercentage.toFixed(1)}% / {challenge.trading_plans.profit_target}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(profitPercentage, challenge.trading_plans.profit_target)} 
                            className="h-2"
                          />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted/20 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
                            <div className={`font-semibold ${
                              (challenge.total_profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {formatCurrency(challenge.total_profit || 0)}
                            </div>
                          </div>
                          
                          <div className="text-center p-3 bg-muted/20 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Highest Balance</div>
                            <div className="font-semibold">
                              {formatCurrency(challenge.highest_balance || challenge.trading_plans.account_size)}
                            </div>
                          </div>
                          
                          <div className="text-center p-3 bg-muted/20 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Trading Days</div>
                            <div className="font-semibold">{challenge.trading_days || 0}</div>
                          </div>
                          
                          <div className="text-center p-3 bg-muted/20 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Max Drawdown</div>
                            <div className="font-semibold">{challenge.trading_plans.max_drawdown}%</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                          <Button className="flex-1">
                            View Details
                          </Button>
                          {challenge.status === 'active' && (
                            <Button variant="outline" className="flex-1">
                              Trading Platform
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          <Card className="hover:border-primary/20 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Purchase New Plan
              </CardTitle>
              <CardDescription>
                Start a new challenge with our range of account sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/plans">
                <Button className="w-full">Browse Plans</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/20 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Detailed analysis of your trading performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/20 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Update your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;