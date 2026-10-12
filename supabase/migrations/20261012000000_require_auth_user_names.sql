-- Require first and last names for every newly created Supabase Auth user.
-- This protects email and phone signup even when the browser-side checks are bypassed.
CREATE OR REPLACE FUNCTION public.require_auth_user_names()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  first_name_value text;
  last_name_value text;
BEGIN
  first_name_value := COALESCE(
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'first_name'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'firstName'), '')
  );
  last_name_value := COALESCE(
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'last_name'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'lastName'), '')
  );

  IF first_name_value IS NULL OR last_name_value IS NULL THEN
    RAISE EXCEPTION 'First name and last name are required to create an account.'
      USING ERRCODE = '23514';
  END IF;

  IF char_length(first_name_value) > 60 OR char_length(last_name_value) > 80 THEN
    RAISE EXCEPTION 'First name or last name exceeds the allowed length.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS require_auth_user_names_on_signup ON auth.users;

CREATE TRIGGER require_auth_user_names_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.require_auth_user_names();
