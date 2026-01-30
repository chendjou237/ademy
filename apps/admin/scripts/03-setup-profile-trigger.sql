-- Script to set up automatic profile creation trigger
-- Run this in your Supabase SQL Editor
-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
   );
RETURN NEW;
EXCEPTION
WHEN unique_violation THEN -- Profile already exists, just return
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Verify the trigger was created
SELECT trigger_name,
   event_manipulation,
   event_object_table,
   action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
