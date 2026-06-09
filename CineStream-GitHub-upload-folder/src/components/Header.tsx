import Loader2 from "lucide-react/dist/esm/icons/loader-2.js";
import LogOut from "lucide-react/dist/esm/icons/log-out.js";
import Menu from "lucide-react/dist/esm/icons/menu.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import UserRound from "lucide-react/dist/esm/icons/user-round.js";
import X from "lucide-react/dist/esm/icons/x.js";
import { type FocusEvent, useEffect, useRef, useState } from "react";
import { imageUrl } from "../api/tmdb";
import { languageOptions, type LanguageCode, type UiText } from "../i18n";
import type { SupabaseUser } from "../lib/supabase";
import type { Movie } from "../types";

type HeaderProps = {
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: Movie[];
  suggestionsLoading: boolean;
  suggestionMessage?: string | null;
  recentSearches: string[];
  trendingSearches: string[];
  onSearchPick: (query: string) => void;
  onSuggestionSelect: (movie: Movie) => void;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  mobileSearchOpen: boolean;
  onOpenMobileSearch: () => void;
  onCloseMobileSearch: () => void;
  authLoading: boolean;
  authUser: SupabaseUser | null;
  cloudSyncing: boolean;
  onLogout: () => void;
  text: UiText;
};

const navItems = [
  { href: "#trending", key: "navTrending" },
  { href: "#wishlist", label: "Wishlist" },
  { href: "#watchlist", label: "Watchlist" },
  { href: "#popular-telugu", key: "navTelugu" },
  { href: "#popular-english", key: "navEnglish" },
  { href: "#upcoming", key: "navUpcoming" }
] as const;

export function Header({
  onRefresh,
  searchQuery,
  onSearchChange,
  suggestions,
  suggestionsLoading,
  suggestionMessage,
  recentSearches,
  trendingSearches,
  onSearchPick,
  onSuggestionSelect,
  language,
  onLanguageChange,
  mobileSearchOpen,
  onOpenMobileSearch,
  onCloseMobileSearch,
  authLoading,
  authUser,
  cloudSyncing,
  onLogout,
  text
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const showSuggestions = searchQuery.trim().length >= 2 && (suggestionsLoading || Boolean(suggestionMessage) || suggestions.length > 0);
  const showSearchAssist = (searchFocused || mobileSearchOpen) && searchQuery.trim().length < 2 && (recentSearches.length > 0 || trendingSearches.length > 0);

  useEffect(() => {
    if (!mobileSearchOpen) return;

    setSearchFocused(true);
    const timer = window.setTimeout(() => mobileSearchInputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [mobileSearchOpen]);

  function handleMobileSearchPick(term: string) {
    onSearchPick(term);
    window.requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
  }

  function handleMobileSuggestionSelect(movie: Movie) {
    onSuggestionSelect(movie);
    onCloseMobileSearch();
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-2 pt-2 sm:px-5 sm:pt-4">
      <div className="glass-panel pointer-events-auto mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 rounded-[24px] px-2 py-1.5 shadow-2xl sm:min-h-18 sm:gap-3 sm:rounded-full sm:px-5 sm:py-2 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4 lg:gap-7">
          <button
            onClick={() => setMenuOpen((current) => !current)}
            className="glass-button grid h-9 w-9 flex-none place-items-center rounded-full text-white transition hover:bg-white/18 sm:h-10 sm:w-10 lg:hidden"
            aria-label={menuOpen ? text.close : text.menu}
            title={menuOpen ? text.close : text.menu}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <a href="#" className="truncate text-base font-black tracking-tight text-cine-red transition hover:scale-[1.02] sm:text-2xl lg:text-3xl">
            CineStream
          </a>
          <nav className="hidden items-center gap-5 text-sm font-medium text-white/80 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} className="relative transition hover:text-white after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-cine-red after:transition-all hover:after:w-full" href={item.href}>
                {"label" in item ? item.label : text[item.key]}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-none items-center gap-1.5 sm:gap-2">
          <div id="search-panel" className="relative hidden min-w-0 scroll-mt-24 sm:block sm:w-48 md:w-56 lg:w-64">
            <label className="glass-input flex h-10 min-w-0 items-center gap-2 rounded-full px-3 text-white transition-all focus-within:bg-white/15 focus-within:ring-cine-red/50">
              <Search size={18} className="flex-none text-white/70" />
              <input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                placeholder={text.searchPlaceholder}
                aria-label="Search loaded movies"
              />
            </label>
            {showSearchAssist ? (
              <div className="glass-panel absolute right-0 top-12 z-50 w-72 rounded-[24px] p-3">
                <SearchAssistContent recentSearches={recentSearches} trendingSearches={trendingSearches} onPick={onSearchPick} />
              </div>
            ) : null}
            {showSuggestions ? (
              <div className="glass-panel absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-[24px]">
                <SearchSuggestionContent suggestions={suggestions} suggestionsLoading={suggestionsLoading} suggestionMessage={suggestionMessage} onSelect={onSuggestionSelect} text={text} />
              </div>
            ) : null}
          </div>
          <button
            onClick={onOpenMobileSearch}
            className="glass-button grid h-9 w-9 flex-none place-items-center rounded-full text-white transition hover:bg-white/18 sm:hidden"
            aria-label="Open search"
            title="Search"
          >
            <Search size={18} />
          </button>
          <AuthControl
            authLoading={authLoading}
            authUser={authUser}
            cloudSyncing={cloudSyncing}
            profileOpen={profileOpen}
            onProfileClose={() => setProfileOpen(false)}
            onProfileOpen={() => setProfileOpen(true)}
            onLogout={onLogout}
            onProfileToggle={() => setProfileOpen((current) => !current)}
          />
          <label className="glass-input flex h-9 w-[50px] flex-none items-center justify-center rounded-full text-[11px] font-black uppercase text-white/80 sm:hidden">
            <span className="sr-only">{text.language}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as LanguageCode)}
              className="w-full bg-transparent text-center text-xs font-black uppercase text-white outline-none"
              aria-label={text.language}
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code} className="bg-zinc-950 text-white">
                  {option.code.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="glass-input hidden h-10 items-center gap-2 rounded-full px-3 text-xs font-bold uppercase tracking-wide text-white/70 sm:flex">
            <span>{text.language}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as LanguageCode)}
              className="bg-transparent text-sm font-bold normal-case tracking-normal text-white outline-none"
              aria-label={text.language}
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code} className="bg-zinc-950 text-white">
                  {option.nativeLabel}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={onRefresh}
            className="grid h-9 w-9 flex-none place-items-center rounded-full bg-cine-red text-white shadow-glow transition hover:scale-105 hover:bg-red-600 active:scale-95 sm:h-10 sm:w-10"
            aria-label={text.refreshMovies}
            title={text.refreshMovies}
          >
            <Sparkles size={18} />
          </button>
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/78 px-3 pb-6 pt-3 backdrop-blur-2xl sm:hidden">
          <div className="glass-panel flex items-center gap-2 rounded-[28px] p-2 shadow-2xl">
            <button
              onClick={onCloseMobileSearch}
              className="glass-button grid h-11 w-11 flex-none place-items-center rounded-full text-white transition hover:bg-white/18"
              aria-label="Close search"
              title={text.close}
            >
              <X size={20} />
            </button>
            <label className="glass-input flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-3 text-white ring-1 ring-cine-red/20">
              <Search size={18} className="flex-none text-cine-red" />
              <input
                ref={mobileSearchInputRef}
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/45"
                placeholder={text.searchPlaceholder}
                aria-label="Search movies"
              />
            </label>
          </div>

          <div className="glass-panel mt-3 max-h-[calc(100vh-88px)] overflow-y-auto rounded-[30px] p-3">
            {showSearchAssist ? <SearchAssistContent recentSearches={recentSearches} trendingSearches={trendingSearches} onPick={handleMobileSearchPick} /> : null}
            {showSuggestions ? (
              <SearchSuggestionContent suggestions={suggestions} suggestionsLoading={suggestionsLoading} suggestionMessage={suggestionMessage} onSelect={handleMobileSuggestionSelect} text={text} />
            ) : null}
            {!showSearchAssist && !showSuggestions ? (
              <div className="rounded-[24px] bg-white/[0.06] p-5 text-sm leading-6 text-white/62 ring-1 ring-white/10">
                Type at least two letters to search TMDB movies.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="glass-panel pointer-events-auto mx-1 mt-2 rounded-[28px] px-4 py-4 shadow-2xl lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-[18px] bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/82 transition hover:bg-white/[0.12] hover:text-white"
              >
                {"label" in item ? item.label : text[item.key]}
              </a>
            ))}
            <label className="mt-2 flex items-center justify-between rounded-[18px] bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/82">
              {text.language}
              <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as LanguageCode)}
                className="rounded bg-zinc-950 px-2 py-1 text-white outline-none"
                aria-label={text.language}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
            {authUser ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="mt-2 flex items-center justify-between rounded-[18px] bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/82 transition hover:bg-white/[0.12] hover:text-white"
              >
                Logout
                <LogOut size={16} />
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function AuthControl({
  authLoading,
  authUser,
  cloudSyncing,
  profileOpen,
  onProfileClose,
  onProfileOpen,
  onLogout,
  onProfileToggle
}: {
  authLoading: boolean;
  authUser: SupabaseUser | null;
  cloudSyncing: boolean;
  profileOpen: boolean;
  onProfileClose: () => void;
  onProfileOpen: () => void;
  onLogout: () => void;
  onProfileToggle: () => void;
}) {
  if (authLoading) {
    return (
      <span className="glass-button grid h-9 w-9 flex-none place-items-center rounded-full text-white/70 sm:h-10 sm:w-10" aria-label="Restoring session" title="Restoring session">
        <Loader2 size={17} className="animate-spin" />
      </span>
    );
  }

  if (!authUser) {
    return null;
  }

  const displayName = getUserDisplayName(authUser);
  const avatar = getUserAvatar(authUser);

  function isDesktopHoverMode() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(max-width: 767px)").matches;
  }

  function handleProfileClick() {
    if (!isDesktopHoverMode()) onProfileToggle();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onProfileClose();
    }
  }

  return (
    <div
      className="group/profile relative flex-none"
      onBlur={handleBlur}
      onMouseEnter={() => {
        if (isDesktopHoverMode()) onProfileOpen();
      }}
      onMouseLeave={() => {
        if (isDesktopHoverMode()) onProfileClose();
      }}
    >
      <button
        type="button"
        onClick={handleProfileClick}
        onFocus={onProfileOpen}
        className="glass-button flex h-9 items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 text-white transition hover:bg-white/18 sm:h-10 sm:gap-2 sm:pr-3"
        aria-expanded={profileOpen}
        aria-label="Profile menu"
      >
        <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-cine-red text-[11px] font-black text-white shadow-glow sm:h-8 sm:w-8 sm:text-xs">
          {avatar ? <img src={avatar} alt={displayName} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : initials(displayName)}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-black sm:block">{displayName}</span>
        {cloudSyncing ? <Loader2 size={14} className="animate-spin text-white/60" /> : null}
      </button>

      <div className={`glass-panel absolute right-0 top-12 z-50 w-64 rounded-[26px] p-3 shadow-2xl ${profileOpen ? "block" : "hidden md:group-hover/profile:block md:group-focus-within/profile:block"}`}>
          <div className="flex items-center gap-3 rounded-[20px] bg-white/[0.06] p-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-cine-red text-sm font-black text-white shadow-glow">
              {avatar ? <img src={avatar} alt={displayName} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : initials(displayName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{displayName}</p>
              <p className="truncate text-xs text-white/50">{authUser.email ?? "Signed in"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.08] text-sm font-black text-white transition hover:bg-cine-red"
          >
            <LogOut size={16} />
            Logout
          </button>
      </div>
    </div>
  );
}

function getUserDisplayName(user: SupabaseUser) {
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined;
  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : undefined;
  return fullName || name || user.email || "Profile";
}

function getUserAvatar(user: SupabaseUser) {
  const avatar = typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : undefined;
  const picture = typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : undefined;
  return avatar || picture || "";
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || <UserRound size={16} />;
}

function SearchAssistContent({ recentSearches, trendingSearches, onPick }: { recentSearches: string[]; trendingSearches: string[]; onPick: (term: string) => void }) {
  return (
    <>
      {recentSearches.length ? <SearchChipGroup title="Recent searches" terms={recentSearches} onPick={onPick} /> : null}
      <SearchChipGroup title="Trending searches" terms={trendingSearches} onPick={onPick} />
    </>
  );
}

function SearchSuggestionContent({
  suggestions,
  suggestionsLoading,
  suggestionMessage,
  onSelect,
  text
}: {
  suggestions: Movie[];
  suggestionsLoading: boolean;
  suggestionMessage?: string | null;
  onSelect: (movie: Movie) => void;
  text: UiText;
}) {
  if (suggestionsLoading) return <p className="px-3 py-3 text-sm font-semibold text-white/60">{text.loading}</p>;
  if (suggestionMessage) return <p className="px-3 py-3 text-sm font-semibold text-white/60">{suggestionMessage}</p>;

  return (
    <>
      {suggestions.slice(0, 6).map((movie) => (
        <button key={movie.id} onClick={() => onSelect(movie)} className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2 text-left transition hover:bg-white/[0.09]">
          <div className="h-12 w-8 flex-none overflow-hidden rounded-[12px] bg-white/[0.06]">
            {movie.poster_path ? <img src={imageUrl(movie.poster_path, "w92")} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{movie.title}</p>
            <p className="text-xs text-white/45">{movie.release_date?.slice(0, 4) || "TMDB"}</p>
          </div>
        </button>
      ))}
    </>
  );
}

function SearchChipGroup({ title, terms, onPick }: { title: string; terms: string[]; onPick: (term: string) => void }) {
  if (!terms.length) return null;

  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/38">{title}</p>
      <div className="flex flex-wrap gap-2">
        {terms.slice(0, 6).map((term) => (
          <button
            key={term}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(term)}
            className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/72 ring-1 ring-white/8 transition hover:bg-cine-red hover:text-white"
            aria-label={`Search ${term}`}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
