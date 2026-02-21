
-- Create app_role enum for admin system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create tournament status enum
CREATE TYPE public.tournament_status AS ENUM ('draft', 'upcoming', 'active', 'paused', 'completed', 'cancelled');

-- Create entry type enum
CREATE TYPE public.entry_type AS ENUM ('free', 'paid');

-- Create certificate type enum
CREATE TYPE public.certificate_type AS ENUM ('participation', 'winner', 'top_n');

-- Create tournaments table
CREATE TABLE public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_rounds INTEGER NOT NULL DEFAULT 5,
    time_control TEXT NOT NULL DEFAULT '10+0',
    max_players INTEGER NOT NULL DEFAULT 32,
    entry_type entry_type NOT NULL DEFAULT 'free',
    entry_fee NUMERIC DEFAULT 0,
    certificate_type certificate_type NOT NULL DEFAULT 'participation',
    certificate_top_n INTEGER DEFAULT 3,
    status tournament_status NOT NULL DEFAULT 'draft',
    current_round INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Tournament policies
CREATE POLICY "Anyone can view published tournaments"
ON public.tournaments FOR SELECT
USING (status != 'draft' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage tournaments"
ON public.tournaments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create tournament registrations table
CREATE TABLE public.tournament_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    player_number INTEGER NOT NULL,
    points NUMERIC DEFAULT 0,
    buchholz NUMERIC DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    is_disqualified BOOLEAN DEFAULT false,
    disqualification_reason TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (tournament_id, user_id),
    UNIQUE (tournament_id, player_number)
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view registrations"
ON public.tournament_registrations FOR SELECT
USING (true);

CREATE POLICY "Users can register themselves"
ON public.tournament_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage registrations"
ON public.tournament_registrations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create tournament rounds table
CREATE TABLE public.tournament_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    round_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (tournament_id, round_number)
);

ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rounds"
ON public.tournament_rounds FOR SELECT
USING (true);

CREATE POLICY "Admins can manage rounds"
ON public.tournament_rounds FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create tournament matches table
CREATE TABLE public.tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    round_id UUID REFERENCES public.tournament_rounds(id) ON DELETE CASCADE NOT NULL,
    white_player_id UUID REFERENCES public.tournament_registrations(id),
    black_player_id UUID REFERENCES public.tournament_registrations(id),
    board_number INTEGER NOT NULL,
    result TEXT,
    white_points NUMERIC,
    black_points NUMERIC,
    pgn TEXT,
    room_code TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches"
ON public.tournament_matches FOR SELECT
USING (true);

CREATE POLICY "Players can update their matches"
ON public.tournament_matches FOR UPDATE
USING (
    white_player_id IN (SELECT id FROM public.tournament_registrations WHERE user_id = auth.uid())
    OR black_player_id IN (SELECT id FROM public.tournament_registrations WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage matches"
ON public.tournament_matches FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create certificates table
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT UNIQUE NOT NULL,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    player_name TEXT NOT NULL,
    tournament_name TEXT NOT NULL,
    rank INTEGER,
    certificate_type certificate_type NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certificates"
ON public.certificates FOR SELECT
USING (true);

CREATE POLICY "Admins can manage certificates"
ON public.certificates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on tournaments
CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tournament tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;

-- Function to generate next player number
CREATE OR REPLACE FUNCTION public.get_next_player_number(p_tournament_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(player_number), 0) + 1
  FROM public.tournament_registrations
  WHERE tournament_id = p_tournament_id
$$;

-- Function to generate certificate ID
CREATE OR REPLACE FUNCTION public.generate_certificate_id()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT 'CERT-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))
$$;
