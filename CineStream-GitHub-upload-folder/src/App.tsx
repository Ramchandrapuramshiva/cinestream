import AlertTriangle from "lucide-react/dist/esm/icons/triangle-alert.js";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.js";
import Film from "lucide-react/dist/esm/icons/film.js";
import Heart from "lucide-react/dist/esm/icons/heart.js";
import Home from "lucide-react/dist/esm/icons/home.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import UserRound from "lucide-react/dist/esm/icons/user-round.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchMovies } from "./api/tmdb";
import { AuthPage } from "./components/AuthPage";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { MovieModal } from "./components/MovieModal";
import { MovieRow } from "./components/MovieRow";
import { PersonalLibrary, type LibraryTab } from "./components/PersonalLibrary";
import { useMovies, type MovieState } from "./hooks/useMovies";
import { getStoredLanguage, translations, type LanguageCode } from "./i18n";
import { getAuthRedirectUrl, isSupabaseConfigured, supabase, type SupabaseUser } from "./lib/supabase";
import { loadCloudMovies, removeCloudMovie, syncLocalMoviesToCloud, upsertCloudMovie, upsertProfile } from "./lib/userLibrary";
import type { Movie } from "./types";

const GENRE_OPTIONS = [
  { id: 28, label: "Action" },
  { id: 12, label: "Adventure" },
  { id: 35, label: "Comedy" },
  { id: 18, label: "Drama" },
  { id: 27, label: "Horror" },
  { id: 10749, label: "Romance" },
  { id: 878, label: "Sci-Fi" },
  { id: 53, label: "Thriller" },
  { id: 10751, label: "Family" }
];

const MOOD_OPTIONS = [
  { id: "Action", genreIds: [28, 12] },
  { id: "Comedy", genreIds: [35] },
  { id: "Romance", genreIds: [10749] },
  { id: "Thriller", genreIds: [53, 80] },
  { id: "Family", genreIds: [10751, 16] },
  { id: "Horror", genreIds: [27] },
  { id: "Feel Good", genreIds: [35, 10751, 18, 10749], minRating: 6.7 }
];

const TRENDING_SEARCHES = ["Dragon", "Peddi", "Pushpa", "Devara", "Kalki", "Hit"];
const INTRO_DURATION_MS = 7000;

export default function App() {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(() => shouldShowIntro());
  const isAuthenticated = Boolean(authUser);
  const { movies, loading, error, refresh } = useMovies(isAuthenticated);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<LanguageCode>(() => getStoredLanguage());
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Movie[]>(() => readStoredMovies("watchlistMovies", ["cinestream-continue-watching"]));
  const [wishlist, setWishlist] = useState<Movie[]>(() => readStoredMovies("wishlistMovies", ["cinestream-watchlist"]));
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readStoredSearches());
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("watchlist");
  const [recommendationSeed, setRecommendationSeed] = useState<Movie | null>(() => readStoredMovies("watchlistMovies", ["cinestream-continue-watching"])[0] ?? null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState("Action");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  const text = translations[language];
  const heroMovies = useMemo(() => getHeroMovies(movies), [movies]);
  const upcomingShowcase = useMemo(() => getUpcomingShowcaseMovies(movies), [movies]);
  const featuredMovie = heroMovies[0] ?? upcomingShowcase[0] ?? movies.trending[0];
  const query = searchQuery.trim();
  const allLoadedMovies = useMemo(() => uniqueMovies(Object.values(movies).flat()), [movies]);
  const wishlistIds = useMemo(() => new Set(wishlist.map((movie) => movie.id)), [wishlist]);
  const visibleMovies = useMemo(() => {
    const cleanQuery = query.toLowerCase();
    if (!cleanQuery) return movies;

    return {
      trending: movies.trending.filter((movie) => movie.title.toLowerCase().includes(cleanQuery)),
      popular: movies.popular.filter((movie) => movie.title.toLowerCase().includes(cleanQuery)),
      upcoming: movies.upcoming.filter((movie) => movie.title.toLowerCase().includes(cleanQuery))
    };
  }, [movies, query]);
  const genreMovies = useMemo(() => {
    if (!selectedGenre) return [];
    return allLoadedMovies.filter((movie) => movie.genre_ids?.includes(selectedGenre));
  }, [allLoadedMovies, selectedGenre]);
  const moodMovies = useMemo(() => getMoodMatches(selectedMood, allLoadedMovies), [allLoadedMovies, selectedMood]);
  const seedMovie = recommendationSeed ?? watchlist[0] ?? featuredMovie;
  const recommendedTelugu = useMemo(() => getSmartRecommendations(seedMovie, allLoadedMovies, "te"), [seedMovie, allLoadedMovies]);
  const recommendedEnglish = useMemo(() => getSmartRecommendations(seedMovie, allLoadedMovies, "en"), [seedMovie, allLoadedMovies]);
  const topRatedTelugu = useMemo(() => sortByRating(uniqueMovies([...movies.popularTelugu, ...movies.latestTelugu, ...movies.trendingTelugu])).slice(0, 18), [movies.latestTelugu, movies.popularTelugu, movies.trendingTelugu]);
  const topRatedEnglish = useMemo(() => sortByRating(uniqueMovies([...movies.popularEnglish, ...movies.latestEnglish, ...movies.trendingEnglish])).slice(0, 18), [movies.latestEnglish, movies.popularEnglish, movies.trendingEnglish]);
  const newlyReleased = useMemo(() => sortByDate(uniqueMovies([...movies.latestTelugu, ...movies.latestEnglish, ...movies.upcoming])).slice(0, 18), [movies.latestEnglish, movies.latestTelugu, movies.upcoming]);
  const hiddenGems = useMemo(() => sortByRating(allLoadedMovies.filter((movie) => movie.vote_average >= 6.8 && movie.vote_average < 8.4 && Boolean(movie.poster_path))).slice(0, 18), [allLoadedMovies]);
  const suggestionMessage = query.length >= 2 && !searchLoading ? searchError ?? (searchResults.length === 0 ? text.noSearchResults : null) : searchError;

  const closeModal = useCallback(() => setSelectedMovie(null), []);

  const rememberSearch = useCallback((term: string) => {
    const cleanTerm = term.trim();
    if (cleanTerm.length < 2) return;

    setRecentSearches((current) => {
      const next = [cleanTerm, ...current.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 6);
      window.localStorage.setItem("cinestream-recent-searches", JSON.stringify(next));
      return next;
    });
  }, []);

  const openMovie = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setRecommendationSeed(movie);
    setWatchlist((current) => {
      const next = [movie, ...current.filter((item) => item.id !== movie.id)].slice(0, 12);
      window.localStorage.setItem("watchlistMovies", JSON.stringify(next));
      if (authUser && supabase) {
        void upsertCloudMovie("watchlist", authUser.id, movie).catch(() => undefined);
      }
      return next;
    });
  }, [authUser]);

  const handleSuggestionSelect = useCallback(
    (movie: Movie) => {
      rememberSearch(query || movie.title);
      openMovie(movie);
    },
    [openMovie, query, rememberSearch]
  );

  const handleSearchPick = useCallback(
    (term: string) => {
      rememberSearch(term);
      setSearchQuery(term);
    },
    [rememberSearch]
  );

  const toggleWatchlist = useCallback((movie: Movie) => {
    setWatchlist((current) => {
      const exists = current.some((item) => item.id === movie.id);
      const next = exists ? current.filter((item) => item.id !== movie.id) : [movie, ...current].slice(0, 24);
      window.localStorage.setItem("watchlistMovies", JSON.stringify(next));
      if (authUser && supabase) {
        const action = exists ? removeCloudMovie("watchlist", authUser.id, movie.id) : upsertCloudMovie("watchlist", authUser.id, movie);
        void action.catch(() => undefined);
      }
      return next;
    });
  }, [authUser]);

  const toggleWishlist = useCallback((movie: Movie) => {
    setWishlist((current) => {
      const exists = current.some((item) => item.id === movie.id);
      const next = exists ? current.filter((item) => item.id !== movie.id) : [movie, ...current].slice(0, 36);
      window.localStorage.setItem("wishlistMovies", JSON.stringify(next));
      if (authUser && supabase) {
        const action = exists ? removeCloudMovie("wishlist", authUser.id, movie.id) : upsertCloudMovie("wishlist", authUser.id, movie);
        void action.catch(() => undefined);
      }
      return next;
    });
  }, [authUser]);

  const handleLanguageChange = useCallback((nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("cinestream-language", nextLanguage);
  }, []);

  const handleEmailLogin = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      setAuthError("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setAuthActionLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setAuthActionLoading(false);
    }
  }, []);

  const handleEmailSignup = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      setAuthError("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setAuthActionLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() || undefined },
          emailRedirectTo: getAuthRedirectUrl()
        }
      });
      if (signUpError) throw signUpError;
      if (data.session?.user) {
        setAuthUser(data.session.user);
      } else {
        setAuthNotice("Account created. Check your email if confirmation is enabled, then sign in.");
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Signup failed. Please try again.");
    } finally {
      setAuthActionLoading(false);
    }
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    if (!supabase) {
      setAuthError("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setAuthActionLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: getAuthRedirectUrl() }
      });
      if (oauthError) throw oauthError;
    } catch (error) {
      setAuthError(getGoogleAuthErrorMessage(error));
      setAuthActionLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    if (!supabase) {
      setAuthUser(null);
      return;
    }

    setAuthActionLoading(true);
    try {
      await supabase.auth.signOut();
      setAuthUser(null);
      setAuthNotice(null);
    } finally {
      setAuthActionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      void searchMovies(query)
        .then((results) => {
          if (!cancelled) {
            setSearchResults(results);
            setSearchError(null);
            if (results.length) rememberSearch(query);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSearchResults([]);
            setSearchError(text.searchUnavailable);
          }
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, query, rememberSearch, text.searchUnavailable]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    void supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setAuthError(sessionError.message);
        const user = data.session?.user ?? null;
        setAuthUser(user);
        if (user) setAuthNotice(null);
        if (user) void upsertProfile(user).catch(() => undefined);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      setAuthLoading(false);
      if (user) setAuthNotice(null);
      if (user) void upsertProfile(user).catch(() => undefined);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authUser || !supabase) return;

    let cancelled = false;

    async function syncLibraries() {
      setCloudSyncing(true);
      try {
        const localWatchlist = readStoredMovies("watchlistMovies", ["cinestream-continue-watching"]);
        const localWishlist = readStoredMovies("wishlistMovies", ["cinestream-watchlist"]);

        await Promise.all([
          syncLocalMoviesToCloud("watchlist", authUser!.id, localWatchlist),
          syncLocalMoviesToCloud("wishlist", authUser!.id, localWishlist)
        ]);

        const [cloudWatchlist, cloudWishlist] = await Promise.all([
          loadCloudMovies("watchlist", authUser!.id),
          loadCloudMovies("wishlist", authUser!.id)
        ]);

        if (!cancelled) {
          setWatchlist(cloudWatchlist);
          setWishlist(cloudWishlist);
          window.localStorage.setItem("watchlistMovies", JSON.stringify(cloudWatchlist));
          window.localStorage.setItem("wishlistMovies", JSON.stringify(cloudWishlist));
        }
      } catch (error) {
        if (!cancelled) setAuthError(error instanceof Error ? error.message : "Could not sync your CineStream library.");
      } finally {
        if (!cancelled) setCloudSyncing(false);
      }
    }

    void syncLibraries();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 520);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.localStorage.removeItem("watchedMovies");
    window.localStorage.removeItem("cinestream-watched");
  }, []);

  useEffect(() => {
    const syncLibraryTabFromHash = () => {
      if (window.location.hash === "#wishlist") setLibraryTab("wishlist");
      if (window.location.hash === "#watchlist") setLibraryTab("watchlist");
    };

    syncLibraryTabFromHash();
    window.addEventListener("hashchange", syncLibraryTabFromHash);
    return () => window.removeEventListener("hashchange", syncLibraryTabFromHash);
  }, []);

  useEffect(() => {
    if (!mobileSearchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!showIntro) return;

    const timer = window.setTimeout(() => setShowIntro(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

  const movieRowActions = { wishlistIds, onToggleWishlist: toggleWishlist };

  if (showIntro) {
    return <AppIntro />;
  }

  if (authLoading) {
    return <SessionRestoreScreen />;
  }

  if (!authUser) {
    return (
      <AuthPage
        configured={isSupabaseConfigured}
        error={authError}
        loading={authActionLoading}
        notice={authNotice}
        sessionLoading={false}
        onGoogleSignIn={handleGoogleSignIn}
        onSignIn={handleEmailLogin}
        onSignUp={handleEmailSignup}
      />
    );
  }

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-transparent text-white">
      <Header
        onRefresh={refresh}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        suggestions={searchResults}
        suggestionsLoading={searchLoading}
        suggestionMessage={suggestionMessage}
        recentSearches={recentSearches}
        trendingSearches={TRENDING_SEARCHES}
        onSearchPick={handleSearchPick}
        onSuggestionSelect={handleSuggestionSelect}
        language={language}
        onLanguageChange={handleLanguageChange}
        mobileSearchOpen={mobileSearchOpen}
        onOpenMobileSearch={() => setMobileSearchOpen(true)}
        onCloseMobileSearch={() => setMobileSearchOpen(false)}
        authLoading={authLoading}
        authUser={authUser}
        cloudSyncing={cloudSyncing}
        onLogout={() => void handleLogout()}
        text={text}
      />

      {error && !loading ? <SetupNotice message={error} helpText={text.setupReady} /> : null}

      <HeroBanner movies={heroMovies} onOpen={openMovie} text={text} />

      <main className="relative z-10 pb-24 pt-2 sm:pt-4">
        <MovieRow id="upcoming-movies" title="Upcoming Movies" movies={upcomingShowcase} loading={loading} emptyMessage="Upcoming movies will appear here soon." onOpen={openMovie} {...movieRowActions} />
        <GenreFilter selectedGenre={selectedGenre} onSelect={setSelectedGenre} />
        <SearchDiscoveryPanel query={query} loading={searchLoading} resultCount={searchResults.length} recentSearches={recentSearches} trendingSearches={TRENDING_SEARCHES} onSearchPick={handleSearchPick} />

        {selectedGenre ? (
          <MovieRow
            id="genre-filter"
            title={`${GENRE_OPTIONS.find((genre) => genre.id === selectedGenre)?.label ?? "Genre"} Movies`}
            movies={genreMovies}
            loading={loading}
            emptyMessage="No loaded movies match this genre yet."
            onOpen={openMovie}
            {...movieRowActions}
          />
        ) : null}

        {query.length >= 2 ? <MovieRow id="search" title={text.searchResults} movies={searchResults} loading={searchLoading} emptyMessage={searchError ?? text.noSearchResults} onOpen={openMovie} {...movieRowActions} /> : null}

        <MoodControls selectedMood={selectedMood} onSelect={setSelectedMood} />
        <MovieRow id="mood-finder" title={`Find by Mood: ${selectedMood}`} movies={moodMovies} loading={loading} emptyMessage="No loaded movies match this mood yet." onOpen={openMovie} {...movieRowActions} />

        {seedMovie ? (
          <>
            <MovieRow id="because-telugu" title={`Based on your Watchlist: Telugu picks like ${seedMovie.title}`} movies={recommendedTelugu} loading={loading} emptyMessage="Open more Telugu movies to improve these picks." onOpen={openMovie} {...movieRowActions} />
            <MovieRow id="because-english" title={`Based on your Watchlist: English picks like ${seedMovie.title}`} movies={recommendedEnglish} loading={loading} emptyMessage="Open more English movies to improve these picks." onOpen={openMovie} {...movieRowActions} />
          </>
        ) : null}

        <PersonalLibrary activeTab={libraryTab} onTabChange={setLibraryTab} watchlist={watchlist} wishlist={wishlist} wishlistIds={wishlistIds} onOpen={openMovie} onToggleWishlist={toggleWishlist} />
        <ProfilePanel watchlistCount={watchlist.length} wishlistCount={wishlist.length} recentSearchesCount={recentSearches.length} />

        <MovieRow id="trending-telugu" title="Trending in Telugu" movies={movies.trendingTelugu} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <MovieRow id="trending-english" title="Trending in English" movies={movies.trendingEnglish} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />

        <LazyMovieRow id="top-rated-telugu" title="Top Rated Telugu" movies={topRatedTelugu} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="top-rated-english" title="Top Rated English" movies={topRatedEnglish} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="newly-released" title="Newly Released" movies={newlyReleased} loading={loading} emptyMessage="New releases will appear here." onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="hidden-gems" title="Hidden Gems" movies={hiddenGems} loading={loading} emptyMessage="Hidden gems will appear here as TMDB data loads." onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="coming-soon" title="Coming Soon" movies={movies.upcoming} loading={loading} emptyMessage={text.noUpcoming} onOpen={openMovie} {...movieRowActions} />

        <LazyMovieRow id="popular-telugu" title={text.popularTelugu} movies={movies.popularTelugu} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="popular-english" title={text.popularEnglish} movies={movies.popularEnglish} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="latest-telugu" title={text.latestTelugu} movies={movies.latestTelugu} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="latest-english" title={text.latestEnglish} movies={movies.latestEnglish} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="trending" title={text.trendingNow} movies={visibleMovies.trending} loading={loading} emptyMessage={query ? text.noSearchResults : text.noTrending} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="popular" title={text.popular} movies={visibleMovies.popular} loading={loading} emptyMessage={query ? text.noSearchResults : text.noPopular} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="upcoming" title={text.upcoming} movies={visibleMovies.upcoming} loading={loading} emptyMessage={query ? text.noSearchResults : text.noUpcoming} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="hindi" title={text.hindiMovies} movies={movies.hindi} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="marathi" title={text.marathiMovies} movies={movies.marathi} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
        <LazyMovieRow id="kannada" title={text.kannadaMovies} movies={movies.kannada} loading={loading} emptyMessage={text.noLanguageMovies} onOpen={openMovie} {...movieRowActions} />
      </main>

      <footer className="px-4 py-8 pb-24 text-center text-sm text-white/50 md:pb-8">
        <div className="glass-panel mx-auto max-w-7xl rounded-[28px] px-6 py-6">
          <p className="text-lg font-black text-cine-red">CineStream</p>
          <p className="mt-2">{text.footer}</p>
        </div>
      </footer>

      {showBackToTop ? <BackToTopButton /> : null}
      <MobileBottomNav onSearchOpen={() => setMobileSearchOpen(true)} />
      <MovieModal
        movie={selectedMovie}
        onClose={closeModal}
        onSelect={openMovie}
        text={text}
        isWatchlisted={selectedMovie ? watchlist.some((item) => item.id === selectedMovie.id) : false}
        isWishlisted={selectedMovie ? wishlist.some((item) => item.id === selectedMovie.id) : false}
        wishlistIds={wishlistIds}
        onToggleWatchlist={toggleWatchlist}
        onToggleWishlist={toggleWishlist}
      />
    </div>
  );
}

function GenreFilter({ selectedGenre, onSelect }: { selectedGenre: number | null; onSelect: (genre: number | null) => void }) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/45">
        <Film size={15} className="text-cine-red" />
        Genre Filters
      </div>
      <div className="glass-panel no-scrollbar flex gap-2 overflow-x-auto rounded-[28px] p-2">
        <button
          onClick={() => onSelect(null)}
          className={`h-10 flex-none rounded-full px-4 text-sm font-black transition ${selectedGenre === null ? "bg-cine-red text-white shadow-glow" : "glass-button text-white/70 hover:bg-white/[0.11] hover:text-white"}`}
          aria-label="Show all genres"
        >
          All Genres
        </button>
        {GENRE_OPTIONS.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className={`h-10 flex-none rounded-full px-4 text-sm font-black transition ${selectedGenre === genre.id ? "bg-cine-red text-white shadow-glow" : "glass-button text-white/70 hover:bg-white/[0.11] hover:text-white"}`}
            aria-label={`Filter ${genre.label} movies`}
          >
            {genre.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function MoodControls({ selectedMood, onSelect }: { selectedMood: string; onSelect: (mood: string) => void }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[30px] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cine-red">
              <Sparkles size={15} />
              Find by Mood
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Pick a vibe, not just a genre</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/58">CineStream maps moods to TMDB genres, ratings, and available language data.</p>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id)}
              className={`h-10 flex-none rounded-full px-4 text-sm font-black transition ${selectedMood === mood.id ? "bg-cine-red text-white shadow-glow" : "glass-button text-white/68 hover:bg-white/[0.08] hover:text-white"}`}
              aria-label={`Find ${mood.id} movies`}
            >
              {mood.id}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchDiscoveryPanel({
  query,
  loading,
  resultCount,
  recentSearches,
  trendingSearches,
  onSearchPick
}: {
  query: string;
  loading: boolean;
  resultCount: number;
  recentSearches: string[];
  trendingSearches: string[];
  onSearchPick: (query: string) => void;
}) {
  if (query.length < 2 || loading || resultCount > 0) return null;
  const suggestions = uniqueSearches([...recentSearches, ...trendingSearches]).slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[28px] p-5">
        <p className="text-lg font-black text-white">No exact matches for "{query}"</p>
        <p className="mt-2 text-sm text-white/58">Try one of these trending or recent searches.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((term) => (
            <button key={term} onClick={() => onSearchPick(term)} className="glass-button rounded-full px-3 py-2 text-xs font-black text-white/70 transition hover:bg-cine-red hover:text-white">
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

type LazyMovieRowProps = {
  id: string;
  title: string;
  movies: Movie[];
  loading?: boolean;
  emptyMessage?: string;
  onOpen: (movie: Movie) => void;
  wishlistIds?: Set<number>;
  onToggleWishlist?: (movie: Movie) => void;
};

function LazyMovieRow(props: LazyMovieRowProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (visible) return <MovieRow {...props} />;

  return (
    <section ref={ref} id={props.id} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h2 className="mb-4 text-lg font-black text-white sm:text-2xl">{props.title}</h2>
      <div className="flex min-h-[204px] gap-3 overflow-hidden pb-5 pt-2 sm:min-h-[252px] sm:gap-4 md:min-h-[300px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-card relative aspect-[2/3] w-32 flex-none overflow-hidden rounded-[26px] sm:w-40 md:w-48 lg:w-52">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          </div>
        ))}
      </div>
    </section>
  );
}

function BackToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-40 grid h-11 w-11 place-items-center rounded-full bg-cine-red text-white shadow-glow transition hover:scale-105 md:bottom-6"
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}

function MobileBottomNav({ onSearchOpen }: { onSearchOpen: () => void }) {
  return (
    <nav className="glass-panel fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[28px] px-2 py-2 text-[11px] font-bold text-white/62 md:hidden">
      <a href="#top" className="flex flex-col items-center gap-1 rounded-[18px] py-1.5 hover:bg-white/[0.08] hover:text-white" aria-label="Home">
        <Home size={18} />
        Home
      </a>
      <button type="button" onClick={onSearchOpen} className="flex flex-col items-center gap-1 rounded-[18px] py-1.5 hover:bg-white/[0.08] hover:text-white" aria-label="Search">
        <Search size={18} />
        Search
      </button>
      <a href="#wishlist" className="flex flex-col items-center gap-1 rounded-[18px] py-1.5 hover:bg-white/[0.08] hover:text-white" aria-label="Wishlist">
        <Heart size={18} />
        Wishlist
      </a>
      <a href="#profile" className="flex flex-col items-center gap-1 rounded-[18px] py-1.5 hover:bg-white/[0.08] hover:text-white" aria-label="Profile">
        <UserRound size={18} />
        Profile
      </a>
    </nav>
  );
}

function AppIntro() {
  return (
    <div className="cinestream-intro fixed inset-0 z-[80] grid place-items-center bg-black text-white" aria-label="CineStream opening animation">
      <div className="cinestream-intro__glow" />
      <div className="cinestream-intro__content">
        <div className="cinestream-intro__mark">C</div>
        <p className="cinestream-intro__title">CineStream</p>
      </div>
    </div>
  );
}

function SessionRestoreScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <div className="glass-panel rounded-[30px] px-6 py-5 text-center shadow-2xl">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[18px] bg-cine-red text-xl font-black shadow-glow">C</div>
        <p className="text-lg font-black text-white">CineStream</p>
        <p className="mt-2 text-sm text-white/55">Restoring your session...</p>
      </div>
    </main>
  );
}

function ProfilePanel({ watchlistCount, wishlistCount, recentSearchesCount }: { watchlistCount: number; wishlistCount: number; recentSearchesCount: number }) {
  const stats = [
    { label: "Watchlist", value: watchlistCount },
    { label: "Wishlist", value: wishlistCount },
    { label: "Recent Searches", value: recentSearchesCount }
  ];

  return (
    <section id="profile" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-6 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[30px] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-cine-red text-white shadow-glow">
              <UserRound size={22} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cine-red">Profile</p>
              <h2 className="mt-1 text-2xl font-black text-white">Your CineStream space</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[22px] bg-white/[0.06] p-3 text-center ring-1 ring-white/10">
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function shouldShowIntro() {
  try {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function readStoredMovies(key: string, fallbackKeys: string[] = []) {
  try {
    const value = window.localStorage.getItem(key);
    if (value) return JSON.parse(value) as Movie[];

    for (const fallbackKey of fallbackKeys) {
      const fallbackValue = window.localStorage.getItem(fallbackKey);
      if (fallbackValue) {
        const movies = JSON.parse(fallbackValue) as Movie[];
        window.localStorage.setItem(key, JSON.stringify(movies));
        return movies;
      }
    }

    return [];
  } catch {
    return [];
  }
}

function readStoredSearches() {
  try {
    const value = window.localStorage.getItem("cinestream-recent-searches");
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function uniqueMovies(movies: Movie[]) {
  const seen = new Set<number>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
}

function uniqueSearches(terms: string[]) {
  const seen = new Set<string>();
  return terms.filter((term) => {
    const key = term.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByRating(movies: Movie[]) {
  return [...movies].sort((a, b) => b.vote_average - a.vote_average || (Date.parse(b.release_date ?? "") || 0) - (Date.parse(a.release_date ?? "") || 0));
}

function sortByDate(movies: Movie[]) {
  return [...movies].sort((a, b) => (Date.parse(b.release_date ?? "") || 0) - (Date.parse(a.release_date ?? "") || 0));
}

function getHeroMovies(movies: MovieState) {
  const preferred = uniqueMovies([
    ...movies.upcomingTelugu,
    ...movies.upcomingEnglish,
    ...movies.upcomingHindi,
    ...movies.upcomingKannada,
    ...movies.upcomingMarathi,
    ...movies.upcoming
  ]);
  const strongMovies = preferred.filter(isStrongUpcomingHeroMovie);
  const fallbackMovies = preferred.filter((movie) => Boolean(movie.poster_path && (movie.backdrop_path || movie.poster_path)));
  return (strongMovies.length ? strongMovies : fallbackMovies).slice(0, 15);
}

function getUpcomingShowcaseMovies(movies: MovieState) {
  return uniqueMovies([
    movies.upcomingTelugu,
    movies.upcomingEnglish,
    movies.upcomingHindi,
    movies.upcomingKannada,
    movies.upcomingMarathi,
    movies.upcoming
  ].flat()).filter((movie) => Boolean(movie.poster_path || movie.backdrop_path)).slice(0, 36);
}

function isStrongUpcomingHeroMovie(movie: Movie) {
  return Boolean(movie.poster_path && (movie.backdrop_path || movie.poster_path) && movie.release_date && movie.overview?.trim().length > 40);
}

function getMoodMatches(moodId: string, movies: Movie[]) {
  const mood = MOOD_OPTIONS.find((option) => option.id === moodId) ?? MOOD_OPTIONS[0];
  return sortByRating(
    movies.filter((movie) => {
      const hasMoodGenre = movie.genre_ids?.some((genreId) => mood.genreIds.includes(genreId));
      const hasRating = mood.minRating ? movie.vote_average >= mood.minRating : true;
      return Boolean(hasMoodGenre && hasRating && movie.poster_path);
    })
  ).slice(0, 18);
}

function getSmartRecommendations(seed: Movie | undefined, movies: Movie[], languageCode: string) {
  if (!seed) return [];
  const seedGenres = seed.genre_ids ?? [];
  return movies
    .filter((movie) => movie.id !== seed.id && movie.original_language === languageCode && Boolean(movie.poster_path))
    .map((movie) => {
      const sharedGenres = movie.genre_ids?.filter((genreId) => seedGenres.includes(genreId)).length ?? 0;
      const ratingDistance = Math.abs(movie.vote_average - seed.vote_average);
      const languageBoost = seed.original_language === movie.original_language ? 2 : 0;
      return { movie, score: sharedGenres * 4 + languageBoost + movie.vote_average - ratingDistance };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.movie)
    .slice(0, 18);
}

function getGoogleAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Google login failed. Please try again.";

  const message = error.message.trim();
  const lowerMessage = message.toLowerCase();
  const setupSignals = [
    "provider is not enabled",
    "provider not enabled",
    "unsupported provider",
    "not enabled",
    "not configured",
    "missing oauth",
    "oauth provider"
  ];
  const looksLikeProviderSetupError =
    setupSignals.some((signal) => lowerMessage.includes(signal)) ||
    (lowerMessage.includes("google") &&
      (lowerMessage.includes("client") || lowerMessage.includes("secret") || lowerMessage.includes("provider") || lowerMessage.includes("oauth")));

  if (looksLikeProviderSetupError) {
    return message ? `Google login is not configured in Supabase. ${message}` : "Google login is not configured in Supabase.";
  }

  return message || "Google login failed. Please try again.";
}

function SetupNotice({ message, helpText }: { message: string; helpText: string }) {
  return (
    <div className="fixed inset-x-0 top-20 z-50 mx-auto max-w-3xl px-4">
      <div className="glass-panel flex items-start gap-3 rounded-[24px] p-4 text-sm text-yellow-50">
        <AlertTriangle className="mt-0.5 flex-none text-yellow-300" size={18} />
        <div>
          <p className="font-bold">{message}</p>
          <p className="mt-1 text-yellow-100/78">{helpText}</p>
        </div>
      </div>
    </div>
  );
}
