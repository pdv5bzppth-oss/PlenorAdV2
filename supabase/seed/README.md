# Supabase backend setup

Kjør disse kommandoene for å sette opp backend lokalt:

1. `supabase start`
2. `supabase db reset` (kjører migrasjoner)
3. `supabase functions serve server --env-file ./supabase/.env.local`

Legg inn følgende variabler i `supabase/.env.local`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
