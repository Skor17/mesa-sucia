
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'lobby',
  mode text NOT NULL DEFAULT 'grupo',
  categories text[] NOT NULL DEFAULT '{}',
  max_rounds int NOT NULL DEFAULT 8,
  round_number int NOT NULL DEFAULT 0,
  current_round_id uuid,
  host_player_id uuid,
  used_prompts text[] NOT NULL DEFAULT '{}',
  used_responses text[] NOT NULL DEFAULT '{}',
  hidden_cards text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar text NOT NULL DEFAULT '🍻',
  secret text NOT NULL,
  score int NOT NULL DEFAULT 0,
  rounds_won int NOT NULL DEFAULT 0,
  votes_received int NOT NULL DEFAULT 0,
  is_ready boolean NOT NULL DEFAULT false,
  has_left boolean NOT NULL DEFAULT false,
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE INDEX players_room_idx ON public.players(room_id);

CREATE TABLE public.rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  number int NOT NULL,
  prompt jsonb NOT NULL,
  special jsonb,
  phase text NOT NULL DEFAULT 'select',
  deadline timestamptz,
  presenter_id uuid,
  target_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.rounds TO service_role;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
CREATE INDEX rounds_room_idx ON public.rounds(room_id);

CREATE TABLE public.hands (
  player_id uuid PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb
);
GRANT ALL ON public.hands TO service_role;
ALTER TABLE public.hands ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  card jsonb NOT NULL,
  votes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (round_id, player_id)
);
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (round_id, voter_id)
);
GRANT ALL ON public.votes TO service_role;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.card_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id text NOT NULL,
  card_text text,
  reason text,
  room_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.card_reports TO service_role;
ALTER TABLE public.card_reports ENABLE ROW LEVEL SECURITY;
