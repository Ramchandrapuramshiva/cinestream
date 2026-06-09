# CineStream

CineStream is a Netflix-style movie streaming interface built with React, TypeScript, Vite, and Tailwind CSS. It uses TMDB for trending, popular, upcoming, movie details, trailers, cast, directors, producers, and artwork.

## Run locally

1. Copy `.env.example` to `.env`.
2. Add your TMDB API key:

```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

3. Install dependencies:

```bash
npm install
```

4. Start the local CineStream server:

```bash
npm run dev
```

The app refreshes TMDB movie rows every five minutes and opens a trailer/details modal when a movie card is selected. In this workspace, `npm run dev` builds the production-ready app first and serves the generated output locally, which avoids the Windows sandbox issue with Vite's dependency optimizer.
