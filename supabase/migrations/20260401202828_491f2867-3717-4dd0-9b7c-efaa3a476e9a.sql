
-- Fix 1: Restrict profile SELECT to own profile only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Also allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Stop storing email as username in the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, 'user_' || substr(NEW.id::text, 1, 8));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Clear existing email-based usernames for privacy
UPDATE public.profiles 
SET username = 'user_' || substr(user_id::text, 1, 8)
WHERE username LIKE '%@%';
