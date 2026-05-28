import type { Credit, FallbackDetails, Keyword, Movie, MovieBundle, MovieDetails, MovieImage, Review, Video } from "../types";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p";

type MovieResponse = {
  results: Movie[];
};

type CreditsResponse = {
  cast: Credit[];
  crew: Credit[];
};

type VideosResponse = {
  results: Video[];
};

type ImagesResponse = {
  posters: MovieImage[];
  backdrops: MovieImage[];
};

type KeywordsResponse = {
  keywords?: Keyword[];
  results?: Keyword[];
};

type ReviewsResponse = {
  results: Review[];
};

type AppendedMovieDetails = MovieDetails & {
  credits?: CreditsResponse;
  videos?: VideosResponse;
  images?: ImagesResponse;
  keywords?: KeywordsResponse;
  reviews?: ReviewsResponse;
  recommendations?: MovieResponse;
  similar?: MovieResponse;
};

const cache = new Map<string, { expiresAt: number; value: unknown }>();
const CACHE_MS = 1000 * 60 * 4;
const UPCOMING_CACHE_MS = 1000 * 60 * 5;
const DETAILS_CACHE_MS = 1000 * 60 * 12;

const PLACEHOLDER_KEYS = new Set(["your_tmdb_api_key_here", "YOUR_TMDB_API_KEY"]);

export const hasTmdbKey = Boolean(API_KEY && !PLACEHOLDER_KEYS.has(API_KEY));

export function imageUrl(path: string | null, size = "w780") {
  return path ? `${IMAGE_URL}/${size}${path}` : "";
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}, maxAge = CACHE_MS): Promise<T> {
  if (!hasTmdbKey) {
    throw new Error("TMDB API key is missing. Please configure VITE_TMDB_API_KEY.");
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY!);
  if (params.language !== "") {
    url.searchParams.set("language", params.language ?? "en-US");
  }
  Object.entries(params).forEach(([key, value]) => {
    if (key !== "language" || value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  const value = (await response.json()) as T;
  cache.set(cacheKey, { expiresAt: Date.now() + maxAge, value });
  return value;
}

export async function getTrendingMovies() {
  const data = await tmdbFetch<MovieResponse>("/trending/movie/day");
  return rankMovies(data.results);
}

export async function getPopularMovies() {
  const data = await tmdbFetch<MovieResponse>("/movie/popular", { page: "1" });
  return rankMovies(data.results);
}

export async function getUpcomingMovies() {
  const today = getTodayDate();
  const pages = await fetchMoviePages(
    "/movie/upcoming",
    { "release_date.gte": today, "primary_release_date.gte": today },
    [1, 2, 3],
    UPCOMING_CACHE_MS
  );
  return rankUpcomingMovies(uniqueMovies(pages).filter(isUpcomingRelease)).filter(hasArtwork);
}

export async function getPopularMoviesByLanguage(originalLanguage: string) {
  const data = await tmdbFetch<MovieResponse>("/discover/movie", {
    page: "1",
    sort_by: "popularity.desc",
    with_original_language: originalLanguage,
    include_adult: "false"
  });
  return rankMovies(data.results).filter(hasArtwork);
}

export async function getUpcomingMoviesByLanguage(originalLanguage: string) {
  const today = getTodayDate();
  const pages = await fetchMoviePages(
    "/discover/movie",
    {
      sort_by: "primary_release_date.asc",
      with_original_language: originalLanguage,
      include_adult: "false",
      "release_date.gte": today,
      "primary_release_date.gte": today
    },
    [1, 2, 3],
    UPCOMING_CACHE_MS
  );
  return rankUpcomingMovies(uniqueMovies(pages).filter(isUpcomingRelease)).filter(hasArtwork);
}

export async function getLatestMoviesByLanguage(originalLanguage: string) {
  const today = new Date().toISOString().slice(0, 10);
  const data = await tmdbFetch<MovieResponse>("/discover/movie", {
    page: "1",
    sort_by: "primary_release_date.desc",
    with_original_language: originalLanguage,
    include_adult: "false",
    "primary_release_date.lte": today,
    "vote_count.gte": "5"
  });
  return rankMovies(data.results).filter(hasArtwork);
}

export async function searchMovies(query: string) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  const data = await tmdbFetch<MovieResponse>("/search/movie", {
    query: cleanQuery,
    include_adult: "false",
    page: "1"
  });
  return rankMovies(data.results).filter(hasArtwork);
}

export async function getMovieBundle(movieId: number): Promise<MovieBundle> {
  const details = await tmdbFetch<AppendedMovieDetails>(
    `/movie/${movieId}`,
    {
      append_to_response: "credits,videos,images,keywords,reviews,recommendations,similar",
      include_image_language: "en,null,te,hi,ta,kn,ml,mr",
      include_video_language: "en,null,te,hi,ta,kn,ml,mr"
    },
    DETAILS_CACHE_MS
  );

  const fallback = getFallbackDetails(details.title);
  const credits = details.credits ?? { cast: [], crew: [] };
  const videos = details.videos ?? { results: [] };
  let videoResults = videos.results ?? [];
  let trailer = pickBestVideo(videoResults);

  if (!trailer) {
    try {
      const directVideos = await tmdbFetch<VideosResponse>(`/movie/${movieId}/videos`, { language: "" }, DETAILS_CACHE_MS);
      videoResults = directVideos.results ?? [];
      trailer = pickBestVideo(videoResults);
    } catch {
      videoResults = [];
    }
  }
  const images = details.images ?? { posters: [], backdrops: [] };
  const keywords = details.keywords?.keywords ?? details.keywords?.results ?? [];
  const reviews = details.reviews?.results ?? [];
  const recommendations = rankMovies(details.recommendations?.results ?? []).slice(0, 12);
  const similar = rankMovies(details.similar?.results ?? []).slice(0, 12);

  return {
    details: applyFallbackToDetails(details, fallback),
    cast: credits.cast.slice(0, 12),
    crew: credits.crew,
    directors: credits.crew.filter((person) => person.job === "Director"),
    producers: credits.crew.filter((person) => person.job === "Producer").slice(0, 5),
    musicDirectors: credits.crew.filter((person) => ["Original Music Composer", "Music", "Music Director", "Songs"].includes(person.job ?? "")).slice(0, 4),
    trailer,
    posters: sortImages(images.posters).slice(0, 10),
    backdrops: sortImages(images.backdrops).slice(0, 10),
    keywords: keywords.slice(0, 16),
    reviews: reviews.slice(0, 3),
    recommendations,
    similar,
    fallback
  };
}

function rankMovies(movies: Movie[]) {
  return [...movies].sort((a, b) => {
    const dateA = Date.parse(a.release_date ?? "") || 0;
    const dateB = Date.parse(b.release_date ?? "") || 0;
    return dateB - dateA || b.vote_average - a.vote_average;
  });
}

function rankUpcomingMovies(movies: Movie[]) {
  return [...movies].sort((a, b) => {
    const dateA = Date.parse(a.release_date ?? "") || Number.MAX_SAFE_INTEGER;
    const dateB = Date.parse(b.release_date ?? "") || Number.MAX_SAFE_INTEGER;
    return dateA - dateB || getPopularity(b) - getPopularity(a) || b.vote_average - a.vote_average;
  });
}

function getPopularity(movie: Movie) {
  return "popularity" in movie && typeof movie.popularity === "number" ? movie.popularity : 0;
}

async function fetchMoviePages(path: string, params: Record<string, string>, pages: number[], maxAge = CACHE_MS) {
  const responses = await Promise.all(
    pages.map((page) => tmdbFetch<MovieResponse>(path, { ...params, page: String(page) }, maxAge))
  );
  return responses.flatMap((response) => response.results ?? []);
}

function uniqueMovies(movies: Movie[]) {
  const seen = new Set<number>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
}

function hasArtwork(movie: Movie) {
  return Boolean(movie.poster_path || movie.backdrop_path);
}

function isUpcomingRelease(movie: Movie) {
  const today = getTodayDate();
  return Boolean(movie.release_date && movie.release_date >= today);
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sortImages(images: MovieImage[]) {
  return [...images].sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
}

function pickBestVideo(videos: Video[]) {
  const youtubeVideos = videos.filter((video) => video.site === "YouTube" && Boolean(video.key?.trim()));
  return (
    youtubeVideos.find((video) => video.official && video.type === "Trailer") ??
    youtubeVideos.find((video) => video.official && video.name.toLowerCase().includes("official trailer")) ??
    youtubeVideos.find((video) => video.type === "Trailer") ??
    youtubeVideos.find((video) => video.type === "Teaser") ??
    youtubeVideos[0] ??
    null
  );
}

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFallbackDetails(title: string): FallbackDetails | undefined {
  const fallbacks: Record<string, FallbackDetails> = {
    gayapadasimham: {
      hero: "Not available",
      heroine: "Not available",
      director: "Not available",
      producer: "Not available",
      musicDirector: "Not available",
      language: "Telugu",
      releaseDate: "Not available",
      story: "Official story information is not available from TMDB yet.",
      posterPath: null,
      backdropPath: null
    },
    peddi: {
      hero: "Not available",
      heroine: "Not available",
      director: "Not available",
      producer: "Not available",
      musicDirector: "Not available",
      language: "Telugu",
      releaseDate: "Not available",
      story: "Official story information is not available from TMDB yet.",
      posterPath: null,
      backdropPath: null
    },
    dragon: {
      hero: "Not available",
      heroine: "Not available",
      director: "Not available",
      producer: "Not available",
      musicDirector: "Not available",
      language: "Not available",
      releaseDate: "Not available",
      story: "Official story information is not available from TMDB yet.",
      posterPath: null,
      backdropPath: null
    }
  };

  return fallbacks[normalizeTitle(title)];
}

function applyFallbackToDetails(details: MovieDetails, fallback?: FallbackDetails): MovieDetails {
  if (!fallback) return details;

  return {
    ...details,
    overview: details.overview || fallback.story || "",
    poster_path: details.poster_path || fallback.posterPath || null,
    backdrop_path: details.backdrop_path || fallback.backdropPath || null,
    release_date: details.release_date || (fallback.releaseDate === "Not available" ? undefined : fallback.releaseDate)
  };
}
