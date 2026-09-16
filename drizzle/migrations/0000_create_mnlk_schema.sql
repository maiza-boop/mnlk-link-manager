-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- LINKS
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  custom_alias BOOLEAN NOT NULL DEFAULT false,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX links_user_id_idx ON public.links (user_id);
CREATE INDEX links_short_code_idx ON public.links (short_code);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT ALL ON public.links TO service_role;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own links select" ON public.links FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own links insert" ON public.links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own links update" ON public.links FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own links delete" ON public.links FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CLICKS
CREATE TABLE public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  referer TEXT,
  device TEXT,
  browser TEXT,
  country TEXT
);

CREATE INDEX clicks_link_id_idx ON public.clicks (link_id);
CREATE INDEX clicks_clicked_at_idx ON public.clicks (clicked_at);

GRANT SELECT ON public.clicks TO authenticated;
GRANT ALL ON public.clicks TO service_role;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own clicks select" ON public.clicks FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.links l WHERE l.id = clicks.link_id AND l.user_id = auth.uid()));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER links_touch_updated_at BEFORE UPDATE ON public.links
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- profile auto-creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- public resolver: finds destination, records click, returns url
CREATE OR REPLACE FUNCTION public.resolve_link(_code TEXT, _user_agent TEXT DEFAULT NULL, _referer TEXT DEFAULT NULL)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _link public.links;
BEGIN
  SELECT * INTO _link FROM public.links WHERE short_code = _code AND active = true LIMIT 1;
  IF _link.id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.clicks (link_id, user_agent, referer) VALUES (_link.id, _user_agent, _referer);
  UPDATE public.links SET total_clicks = total_clicks + 1 WHERE id = _link.id;

  RETURN _link.original_url;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_link(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_link(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- public availability check for custom aliases
CREATE OR REPLACE FUNCTION public.short_code_available(_code TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.links WHERE short_code = _code);
$$;

GRANT EXECUTE ON FUNCTION public.short_code_available(TEXT) TO anon, authenticated, service_role;