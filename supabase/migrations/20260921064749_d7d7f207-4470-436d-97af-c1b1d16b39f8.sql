ALTER TABLE public.rooms
ADD COLUMN max_players integer NOT NULL DEFAULT 10;

ALTER TABLE public.rooms
ADD CONSTRAINT rooms_max_players_range CHECK (max_players BETWEEN 2 AND 10);