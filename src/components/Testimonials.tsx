import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      name: "Marcus Johnson",
      role: "Professional Trader",
      location: "New York, USA",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "Nova Funded Traders changed my life. I went from struggling with my own capital to managing $100K in just 6 months. The support team is incredible and the rules are fair.",
      profit: "$12,450",
      timeframe: "6 months"
    },
    {
      name: "Sarah Chen",
      role: "Forex Specialist",
      location: "Singapore",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "The evaluation process was straightforward and the profit split is the best in the industry. I've been consistently profitable for 8 months now.",
      profit: "$8,900",
      timeframe: "8 months"
    },
    {
      name: "Ahmed Al-Rashid",
      role: "Swing Trader",
      location: "Dubai, UAE",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "What I love most about Nova is the flexibility. I can trade my own strategy without restrictions. The community is also very supportive.",
      profit: "$15,200",
      timeframe: "4 months"
    },
    {
      name: "Elena Rodriguez",
      role: "Day Trader",
      location: "Madrid, Spain",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "Professional platform, fast payouts, and excellent risk management. I recommend Nova to any serious trader looking to scale their operations.",
      profit: "$9,750",
      timeframe: "10 months"
    },
    {
      name: "James Wilson",
      role: "Scalping Expert",
      location: "London, UK",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "The best prop firm I've worked with. Transparent rules, fair evaluation, and they actually want you to succeed. Currently managing $200K.",
      profit: "$22,800",
      timeframe: "1 year"
    },
    {
      name: "Priya Sharma",
      role: "Crypto Trader",
      location: "Mumbai, India",
      image: "/api/placeholder/60/60",
      rating: 5,
      text: "Nova's multi-asset approach allowed me to diversify my trading. The analytics dashboard helps me track performance across all markets.",
      profit: "$7,350",
      timeframe: "5 months"
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
    <section className="py-20 bg-gradient-to-br from-background to-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            What Our{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Traders Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what successful traders are saying about their experience with Nova Funded Traders.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.6 }}
              className="group"
            >
              <div className="relative h-full p-8 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-20">
                  <Quote className="h-8 w-8 text-primary" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground leading-relaxed mb-6 relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-lg font-bold text-green-500">{testimonial.profit}</div>
                    <div className="text-xs text-muted-foreground">Total Profit</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-lg font-bold text-primary">{testimonial.timeframe}</div>
                    <div className="text-xs text-muted-foreground">Active Since</div>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  4.9/5
                </div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  98%
                </div>
                <p className="text-muted-foreground">Success Rate</p>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  $2.5M+
                </div>
                <p className="text-muted-foreground">Profits Paid Out</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;