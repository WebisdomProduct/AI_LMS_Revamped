-- Fix infinite recursion in profiles RLS policy by moving admin check into a SECURITY DEFINER function

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
  );
$$;

-- Replace the recursive policy (it referenced profiles inside the policy itself)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());
