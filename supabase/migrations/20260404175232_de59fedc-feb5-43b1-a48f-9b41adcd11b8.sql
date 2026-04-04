
-- Fix 1: Prevent non-admin users from inserting into user_roles
-- The ALL policy only covers SELECT/UPDATE/DELETE via USING, not INSERT.
-- Add an explicit INSERT policy restricted to admins only.
CREATE POLICY "Only admins can insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Rewrite has_role to use auth.uid() internally
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;

-- Fix 3: Restrict comments SELECT to authenticated users only
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;

CREATE POLICY "Comments are viewable by authenticated users"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);
