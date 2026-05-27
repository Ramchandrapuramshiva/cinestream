# CineStream Vercel Deployment

Use these exact settings when deploying CineStream to Vercel.

## Vercel Settings

- Framework Preset: Vite
- Install Command: npm install
- Build Command: npm run build
- Output Directory: dist

## Environment Variable

Add this in Vercel Project Settings > Environment Variables:

```bash
VITE_TMDB_API_KEY=your_real_tmdb_api_key
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
```

- The production build is generated in `dist`.
- CineStream is a Vite single-page app, so Vercel can serve it as a static site.
