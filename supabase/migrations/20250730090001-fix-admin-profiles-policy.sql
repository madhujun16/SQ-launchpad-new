-- Fix admin policies for profiles table
-- This migration adds the missing admin policies that were accidentally removed

-- Add admin policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

-- Add admin policy to allow admins to insert new profiles
CREATE POLICY "Admins can insert new profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Add admin policy to allow admins to update profiles
CREATE POLICY "Admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());

-- Add admin policy to allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin()); 