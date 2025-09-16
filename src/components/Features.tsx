import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Clock, 
  Users, 
  BarChart3,
  Zap,
  Award,
  Target
} from "lucide-react";

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: TrendingUp,
      title: "Generous Profit Split",
      description: "Keep up to 80% of your trading profits with our industry-leading profit sharing model.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Risk Protection",
      description: "Trade with confidence knowing our risk management system protects both you and our capital.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: DollarSign,
      title: "Scale Up to $200K",
      description: "Start with smaller accounts and scale up to $200,000 in trading capital as you prove your skills.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Flexible Trading",
      description: "Trade at your own pace with our flexible evaluation periods and trading schedules.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a community of successful traders sharing strategies, tips, and market insights.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed performance analytics and insights to improve your trading strategies.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: Zap,
      title: "Instant Funding",
      description: "Get funded quickly after passing your evaluation with our streamlined approval process.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Award,
      title: "Multiple Markets",
      description: "Trade Forex, Indices, Commodities, and Cryptocurrencies with our diverse market access.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Target,
      title: "Clear Objectives",
      description: "Transparent rules and achievable profit targets designed for trader success.",
      color: "from-cyan-500 to-blue-500"
    }
  ];

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

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nova Funded Traders
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We provide the tools, capital, and support you need to become a successful prop trader. 
            Here's what sets us apart from the competition.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.6 }}
              className="group relative"
            >
              <div className="relative h-full p-8 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                {/* Icon */}
                <div className="mb-6">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Trading Journey?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of traders who have already transformed their trading careers with Nova Funded Traders.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;