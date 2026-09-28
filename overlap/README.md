# Overlap

Pick one film, book or song a day. Share a link to it. See everyone else who picked the same thing, today and before.

The day is global: it turns over at midnight UTC for everyone.

## What's here

| Path | What it is |
| --- | --- |
| `/` | Sign in, choose your name, then pick today's work and share it |
| `/search` | Look up any work and go to its page |
| `/<work>` | Everyone who shared a work, today and before, e.g. `/stalker-andrei-tarkovsky` |
| `/<work>/<name>` | The link people post, e.g. `/stalker-andrei-tarkovsky/luke`, with a preview card for X |
| `/u/<name>` | A person's profile: a dated list of everything they've shared |

The database is one `profiles` table and one `picks` table (see `supabase/schema.sql`). The work's page address is its title plus its creator, so every edition of a book or version of a song ends up on the same page.

## Set it up

You need a free Supabase account, a free TMDB account (for film search), and Node.js 20 or later.

1. **Create the database.** Make a new project at supabase.com. Open the SQL editor, paste in `supabase/schema.sql`, and run it.
2. **Turn on email sign-in.** In Supabase, go to Authentication > URL Configuration. Set the Site URL to your address (`http://localhost:3000` while developing) and add `<your address>/auth/callback` to the redirect URLs. Email sign-in is on by default. For real use, add your own email sender under Authentication > Emails, because Supabase's built-in one only sends a few emails an hour.
3. **Get a film search key.** At themoviedb.org, go to Settings > API and copy the API Read Access Token. Books (Open Library) and songs (iTunes) need no key.
4. **Add your settings.** Copy `.env.example` to `.env.local` and fill in the four values.
5. **Run it.**
   ```
   npm install
   npm run dev
   ```
   Then open http://localhost:3000.

## Put it online

1. Push the folder to a GitHub repository.
2. Import it at vercel.com and add the same four settings under Environment Variables, with `NEXT_PUBLIC_SITE_URL` set to your domain (for example `https://overlap.app`).
3. Add your domain in Vercel under Settings > Domains.
4. In Supabase, change the Site URL and redirect URL to the new domain.

To check the preview card, paste a shared link into X's post box, or into opengraph.xyz.

## Known limits of this first version

- The site trusts the title and creator the browser sends when someone picks, so a determined person could post a made-up work. Checking picks against the catalogue on the server would close this.
- Film search makes one extra request per result to find the director, so it's slower than book and song search.
- The same work can occasionally get two pages if the catalogues spell the creator differently (for example "W. G. Sebald" and "W.G. Sebald").
