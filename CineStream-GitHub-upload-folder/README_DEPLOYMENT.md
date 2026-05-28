# CineStream Vercel Deployment

Use these exact settings when deploying CineStream to Vercel.

## Vercel Settings

- Framework Preset: Vite
- Install Command: npm install
- Build Command: npm run build
- Output Directory: dist

## Environment Variables

Add this in Vercel Project Settings > Environment Variables:

```bash
VITE_TMDB_API_KEY=your_real_tmdb_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Local Production Check

Run these before deploying:

```bash
npm install
npm run build
npm run preview
```

## Notes

- The local `.env` file must not be committed.
- `.env.example` should stay in the repository with the placeholder value:

```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- The production build is generated in `dist`.
- CineStream is a Vite single-page app, so Vercel can serve it as a static site.
- Supabase authentication requires the Vercel production URL in Supabase Auth URL settings.
