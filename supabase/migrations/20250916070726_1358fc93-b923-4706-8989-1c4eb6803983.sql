-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  trading_experience TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trading plans table
CREATE TABLE public.trading_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  account_size DECIMAL(12,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  profit_target DECIMAL(5,2) NOT NULL,
  max_drawdown DECIMAL(5,2) NOT NULL,
  daily_drawdown DECIMAL(5,2) NOT NULL,
  evaluation_period INTEGER NOT NULL,
  min_trading_days INTEGER NOT NULL,
  profit_split DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user challenges table
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.trading_plans(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'passed', 'failed', 'funded')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  current_balance DECIMAL(12,2) DEFAULT 0,
  highest_balance DECIMAL(12,2) DEFAULT 0,
  lowest_balance DECIMAL(12,2) DEFAULT 0,
  total_profit DECIMAL(12,2) DEFAULT 0,
  trading_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.trading_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Create trading history table
CREATE TABLE public.trading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.user_challenges(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  profit_loss DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FAQ table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trading plans policies (public read)
CREATE POLICY "Trading plans are viewable by everyone" ON public.trading_plans FOR SELECT USING (is_active = true);

-- User challenges policies
CREATE POLICY "Users can view own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trading history policies
CREATE POLICY "Users can view own trading history" ON public.trading_history 
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_challenges WHERE id = challenge_id));

-- Blog posts policies (public read for published)
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts FOR SELECT USING (published = true);

-- FAQ policies (public read for active)
CREATE POLICY "Active FAQs are viewable by everyone" ON public.faqs FOR SELECT USING (is_active = true);

-- Insert default trading plans
INSERT INTO public.trading_plans (name, account_size, price, profit_target, max_drawdown, daily_drawdown, evaluation_period, min_trading_days, profit_split) VALUES
('Starter Challenge', 10000, 99, 8, 5, 4, 30, 5, 80),
('Standard Challenge', 25000, 199, 8, 5, 4, 30, 5, 80),
('Advanced Challenge', 50000, 349, 8, 5, 4, 30, 5, 80),
('Professional Challenge', 100000, 599, 8, 5, 4, 30, 5, 80),
('Elite Challenge', 200000, 999, 8, 5, 4, 30, 5, 80);

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('What is a prop trading challenge?', 'A prop trading challenge is an evaluation process where traders demonstrate their skills by meeting specific profit targets while managing risk within set parameters.', 'General', 1),
('How long do I have to complete the challenge?', 'You have 30 days to complete the evaluation phase, with a minimum of 5 trading days required.', 'Challenge', 2),
('What happens after I pass the challenge?', 'Once you pass the challenge, you become a funded trader and receive a live account to trade with our capital.', 'After Challenge', 3),
('What is the profit split?', 'We offer an 80% profit split, meaning you keep 80% of the profits you generate while trading our capital.', 'Profit Split', 4);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON public.user_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();