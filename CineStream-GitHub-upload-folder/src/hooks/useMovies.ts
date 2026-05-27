import { useCallback, useEffect, useState } from "react";
import {
  getLatestMoviesByLanguage,
  getPopularMovies,
  getPopularMoviesByLanguage,
  getTrendingMovies,
  getUpcomingMovies,
  hasTmdbKey
} from "../api/tmdb";
import type { Movie } from "../types";

const REFRESH_MS = 1000 * 60 * 5;
const MISSING_TMDB_KEY_MESSAGE = "TMDB API key is missing. Please configure VITE_TMDB_API_KEY.";

export type MovieState = {
  trending: Movie[];
  popular: Movie[];
  upcoming: Movie[];
  popularTelugu: Movie[];
  popularEnglish: Movie[];
  trendingTelugu: Movie[];
  trendingEnglish: Movie[];
  latestTelugu: Movie[];
  latestEnglish: Movie[];
  hindi: Movie[];
  marathi: Movie[];
  kannada: Movie[];
};

const initialMovies: MovieState = {
  trending: [],
  popular: [],
  upcoming: [],
  popularTelugu: [],
  popularEnglish: [],
  trendingTelugu: [],
  trendingEnglish: [],
  latestTelugu: [],
  latestEnglish: [],
  hindi: [],
  marathi: [],
  kannada: []
};

export function useMovies() {
  const [movies, setMovies] = useState<MovieState>(initialMovies);
  const [loading, setLoading] = useState(hasTmdbKey);
  const [error, setError] = useState<string | null>(hasTmdbKey ? null : MISSING_TMDB_KEY_MESSAGE);

  const loadMovies = useCallback(async () => {
    if (!hasTmdbKey) {
      setError(MISSING_TMDB_KEY_MESSAGE);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading((current) => current || movies.trending.length === 0);

    try {
      const [
        trendingResult,
        popularResult,
        upcomingResult,
        popularTeluguResult,
        popularEnglishResult,
        latestTeluguResult,
        latestEnglishResult,
        hindiResult,
        marathiResult,
        kannadaResult
      ] = await Promise.allSettled([
        getTrendingMovies(),
        getPopularMovies(),
        getUpcomingMovies(),
        getPopularMoviesByLanguage("te"),
        getPopularMoviesByLanguage("en"),
        getLatestMoviesByLanguage("te"),
        getLatestMoviesByLanguage("en"),
        getPopularMoviesByLanguage("hi"),
        getPopularMoviesByLanguage("mr"),
        getPopularMoviesByLanguage("kn")
      ]);
      const trending = trendingResult.status === "fulfilled" ? trendingResult.value : [];
      const popular = popularResult.status === "fulfilled" ? popularResult.value : [];
      const upcoming = upcomingResult.status === "fulfilled" ? upcomingResult.value : [];
      const popularTelugu = popularTeluguResult.status === "fulfilled" ? popularTeluguResult.value : [];
      const popularEnglish = popularEnglishResult.status === "fulfilled" ? popularEnglishResult.value : [];
      const trendingTelugu = popularTelugu.slice(0, 14);
      const trendingEnglish = popularEnglish.slice(0, 14);
      const latestTelugu = latestTeluguResult.status === "fulfilled" ? latestTeluguResult.value : [];
      const latestEnglish = latestEnglishResult.status === "fulfilled" ? latestEnglishResult.value : [];
      const hindi = hindiResult.status === "fulfilled" ? hindiResult.value : [];
      const marathi = marathiResult.status === "fulfilled" ? marathiResult.value : [];
      const kannada = kannadaResult.status === "fulfilled" ? kannadaResult.value : [];

      setMovies({
        trending,
        popular,
        upcoming,
        popularTelugu,
        popularEnglish,
        trendingTelugu,
        trendingEnglish,
        latestTelugu,
        latestEnglish,
        hindi,
        marathi,
        kannada
      });
      if (!trending.length && !popular.length && !upcoming.length && !popularTelugu.length && !popularEnglish.length) {
        setError("CineStream could not load TMDB movies right now. Please try again soon.");
      }
    } catch {
      setError("CineStream could not reach TMDB. Check your API key or connection.");
    } finally {
      setLoading(false);
    }
  }, [movies.trending.length]);

  useEffect(() => {
    void loadMovies();
    const timer = window.setInterval(() => void loadMovies(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadMovies]);

  return { movies, loading, error, refresh: loadMovies };
}
