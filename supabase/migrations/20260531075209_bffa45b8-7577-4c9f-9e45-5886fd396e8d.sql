INSERT INTO public.user_roles (user_id, role)
VALUES ('f7134c9a-63b2-42e5-a6aa-6eaf580f81f8', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;