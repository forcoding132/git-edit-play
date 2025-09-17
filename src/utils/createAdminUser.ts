import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async () => {
  try {
    // First, try to sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'shozabsajjad10@gmail.com',
      password: 'Syed12@',
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'User',
        }
      }
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }

    console.log('Admin user created/exists:', signUpData?.user?.email);
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
};

// Function to check if current user is admin
export const isAdminUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === 'shozabsajjad10@gmail.com';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};