import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TradingPlan {
  id: string;
  name: string;
  account_size: number;
  price: number;
  profit_target: number;
  max_drawdown: number;
  daily_drawdown: number;
  evaluation_period: number;
  min_trading_days: number;
  profit_split: number;
}

const TradingPlans = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [plans, setPlans] = useState<TradingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('trading_plans')
          .select('*')
          .eq('is_active', true)
          .order('account_size', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching trading plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPlanBadge = (index: number) => {
    if (index === 1) return { label: "Most Popular", color: "bg-primary", icon: Star };
    if (index === 3) return { label: "Best Value", color: "bg-accent", icon: Zap };
    return null;
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading trading plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trading Challenge
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the perfect account size to match your trading experience and goals. 
            All plans feature the same rules and profit targets.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {plans.map((plan, index) => {
            const badge = getPlanBadge(index);
            const isPopular = index === 1;

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                transition={{ duration: 0.6 }}
                className={`relative group ${
                  isPopular ? 'lg:scale-105' : ''
                }`}
              >
                <div className={`relative h-full p-6 bg-card rounded-2xl border-2 transition-all duration-300 ${
                  isPopular 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-border hover:border-primary/20 hover:shadow-lg'
                }`}>
                  {/* Badge */}
                  {badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className={`${badge.color} text-white border-0 px-4 py-1`}>
                        <badge.icon className="h-3 w-3 mr-1" />
                        {badge.label}
                      </Badge>
                    </div>
                  )}

                  {/* Plan Name */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {formatCurrency(plan.account_size)}
                    </div>
                    <p className="text-muted-foreground mt-2">Account Size</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profit Target</span>
                      <span className="font-semibold text-green-500">{plan.profit_target}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max Drawdown</span>
                      <span className="font-semibold">{plan.max_drawdown}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Daily Drawdown</span>
                      <span className="font-semibold">{plan.daily_drawdown}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time Limit</span>
                      <span className="font-semibold">{plan.evaluation_period} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Min Trading Days</span>
                      <span className="font-semibold">{plan.min_trading_days} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profit Split</span>
                      <span className="font-semibold text-primary">{plan.profit_split}%</span>
                    </div>
                  </div>

                  {/* Included Features */}
                  <div className="space-y-2 mb-8">
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>All Major Markets</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Expert Advisors Allowed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Weekend Holding</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Free Retakes</span>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="mt-auto">
                    <div className="text-center mb-4">
                      <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
                      <span className="text-muted-foreground text-sm ml-1">one-time</span>
                    </div>
                    <Link to={`/auth?plan=${plan.id}`} className="w-full">
                      <Button 
                        className={`w-full ${
                          isPopular 
                            ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90' 
                            : 'bg-primary hover:bg-primary/90'
                        } text-white font-semibold py-3 rounded-lg transition-all duration-300`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            All plans include our comprehensive trading education and ongoing support. 
            <Link to="/rules" className="text-primary hover:underline ml-1">
              View detailed rules and requirements →
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TradingPlans;