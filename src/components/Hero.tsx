import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const Hero = () => {
  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    { number: 15000, label: "Active Traders", suffix: "+" },
    { number: 2.5, label: "Million Paid", prefix: "$", suffix: "M" },
    { number: 98, label: "Success Rate", suffix: "%" },
    { number: 24, label: "Countries", suffix: "+" },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                🚀 #1 Prop Trading Platform
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold leading-tight"
            >
              Trade with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Our Capital
              </span>
              <br />
              Keep the Profits
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground leading-relaxed max-w-xl"
            >
              Join thousands of successful traders who have passed our evaluation and now trade with up to $200,000 in capital. Prove your skills, get funded, and keep 80% of your profits.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">80% Profit Split</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Risk Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Up to $200K</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">30-Day Challenge</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/auth?tab=register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Challenge
                </Button>
              </Link>
              <Link to="/plans">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg transition-all duration-300"
                >
                  View All Plans
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Trading Dashboard Preview */}
            <div className="relative bg-card rounded-2xl border border-border p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Trading Dashboard</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-green-500">$12,450</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Daily P&L</p>
                  <p className="text-2xl font-bold text-green-500">+$245</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Max Drawdown</p>
                  <p className="text-2xl font-bold text-muted-foreground">2.5%</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Profit Target</p>
                  <p className="text-2xl font-bold text-primary">65%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Challenge Progress</span>
                  <span className="text-primary font-semibold">65%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  ></motion.div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-card border border-border rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-500">+$1,245 Today</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">98% Win Rate</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 50 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 pt-20 border-t border-border"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {statsInView ? (
                    <>
                      {stat.prefix}
                      <CountUp end={stat.number} duration={2} />
                      {stat.suffix}
                    </>
                  ) : (
                    "0"
                  )}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;