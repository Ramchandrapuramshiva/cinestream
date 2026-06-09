export type Movie = {
  id: number;
  title: string;
  name?: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  original_language?: string;
  genre_ids?: number[];
};

export type MovieDetails = Movie & {
  runtime: number | null;
  genres: { id: number; name: string }[];
  budget: number;
  revenue: number;
  status?: string;
  tagline?: string;
};

export type Credit = {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path: string | null;
  gender?: number;
};

export type Video = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export type MovieImage = {
  file_path: string;
  width: number;
  height: number;
  vote_average?: number;
};

export type Keyword = {
  id: number;
  name: string;
};

export type Review = {
  id: string;
  author: string;
  content: string;
  created_at: string;
  url: string;
  author_details?: {
    rating?: number | null;
    avatar_path?: string | null;
  };
};

export type WatchProvider = {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
  display_priority?: number;
};

export type WatchProviderGroups = {
  stream: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  link?: string;
};

export type FallbackDetails = {
  hero?: string;
  heroine?: string;
  director?: string;
  producer?: string;
  musicDirector?: string;
  language?: string;
  releaseDate?: string;
  story?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
};

export type MovieBundle = {
  details: MovieDetails;
  cast: Credit[];
  crew: Credit[];
  directors: Credit[];
  producers: Credit[];
  musicDirectors: Credit[];
  trailer: Video | null;
  posters: MovieImage[];
  backdrops: MovieImage[];
  keywords: Keyword[];
  reviews: Review[];
  recommendations: Movie[];
  similar: Movie[];
  watchProviders: WatchProviderGroups;
  fallback?: FallbackDetails;
};
