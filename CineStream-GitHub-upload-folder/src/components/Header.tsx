import Menu from "lucide-react/dist/esm/icons/menu.js";
import Search from "lucide-react/dist/esm/icons/search.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import X from "lucide-react/dist/esm/icons/x.js";
import { useState } from "react";
import { imageUrl } from "../api/tmdb";
import { languageOptions, type LanguageCode, type UiText } from "../i18n";
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
  text
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const showSuggestions = searchQuery.trim().length >= 2 && (suggestionsLoading || Boolean(suggestionMessage) || suggestions.length > 0);
  const showSearchAssist = searchFocused && searchQuery.trim().length < 2 && (recentSearches.length > 0 || trendingSearches.length > 0);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="glass-panel pointer-events-auto mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 rounded-[28px] px-3 py-2 shadow-2xl sm:min-h-18 sm:rounded-full sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-4 lg:gap-7">
          <button
            onClick={() => setMenuOpen((current) => !current)}
            className="glass-button grid h-10 w-10 flex-none place-items-center rounded-full text-white transition hover:bg-white/18 lg:hidden"
            aria-label={menuOpen ? text.close : text.menu}
            title={menuOpen ? text.close : text.menu}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <a href="#" className="text-xl font-black tracking-tight text-cine-red transition hover:scale-[1.02] sm:text-2xl lg:text-3xl">
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

        <div className="flex min-w-0 items-center gap-2">
          <div id="search-panel" className="relative min-w-0 flex-1 scroll-mt-24">
            <label className="glass-input flex h-10 min-w-0 items-center gap-2 rounded-full px-3 text-white transition-all focus-within:w-44 focus-within:bg-white/15 focus-within:ring-cine-red/50 sm:w-48 md:w-56 lg:w-64">
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
                {recentSearches.length ? <SearchChipGroup title="Recent searches" terms={recentSearches} onPick={onSearchPick} /> : null}
                <SearchChipGroup title="Trending searches" terms={trendingSearches} onPick={onSearchPick} />
              </div>
            ) : null}
            {showSuggestions ? (
              <div className="glass-panel absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-[24px]">
                {suggestionsLoading ? <p className="px-3 py-3 text-sm font-semibold text-white/60">{text.loading}</p> : null}
                {!suggestionsLoading && suggestionMessage ? <p className="px-3 py-3 text-sm font-semibold text-white/60">{suggestionMessage}</p> : null}
                {!suggestionsLoading && !suggestionMessage
                  ? suggestions.slice(0, 5).map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => onSuggestionSelect(movie)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/[0.09]"
                      >
                    <div className="h-12 w-8 flex-none overflow-hidden rounded-[12px] bg-white/[0.06]">
                          {movie.poster_path ? <img src={imageUrl(movie.poster_path, "w92")} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{movie.title}</p>
                          <p className="text-xs text-white/45">{movie.release_date?.slice(0, 4) || "TMDB"}</p>
                        </div>
                      </button>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
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
            className="grid h-10 w-10 flex-none place-items-center rounded-full bg-cine-red text-white shadow-glow transition hover:scale-105 hover:bg-red-600 active:scale-95"
            aria-label={text.refreshMovies}
            title={text.refreshMovies}
          >
            <Sparkles size={18} />
          </button>
        </div>
      </div>

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
          </nav>
        </div>
      ) : null}
    </header>
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
