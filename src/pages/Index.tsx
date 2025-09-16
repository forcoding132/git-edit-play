import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TradingPlans from "@/components/TradingPlans";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { testSupabaseConnection } from "@/utils/supabaseTest";

const Index = () => {
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <TradingPlans />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
