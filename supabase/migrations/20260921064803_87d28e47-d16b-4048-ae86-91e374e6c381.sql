CREATE POLICY "server_only_rooms" ON public.rooms FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "server_only_players" ON public.players FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "server_only_rounds" ON public.rounds FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "server_only_hands" ON public.hands FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "server_only_submissions" ON public.submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "server_only_votes" ON public.votes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "server_only_card_reports" ON public.card_reports FOR ALL TO service_role USING (true) WITH CHECK (true);