import Film from "lucide-react/dist/esm/icons/film.js";
import Heart from "lucide-react/dist/esm/icons/heart.js";
import type { Movie } from "../types";
import { MovieRow } from "./MovieRow";

export type LibraryTab = "watchlist" | "wishlist";

type PersonalLibraryProps = {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  watchlist: Movie[];
  wishlist: Movie[];
  wishlistIds: Set<number>;
  onOpen: (movie: Movie) => void;
  onToggleWishlist: (movie: Movie) => void;
};

const tabs: { id: LibraryTab; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "watchlist", label: "Watchlist", description: "Movies you opened, started, or want to continue.", icon: <Film size={16} /> },
  { id: "wishlist", label: "Wishlist", description: "Movies saved to watch later.", icon: <Heart size={16} /> }
];

export function PersonalLibrary({ activeTab, onTabChange, watchlist, wishlist, wishlistIds, onOpen, onToggleWishlist }: PersonalLibraryProps) {
  const activeMovies = activeTab === "watchlist" ? watchlist : wishlist;
  const emptyMessage = activeTab === "watchlist" ? "Open a movie and it will appear here." : "Save movies to your wishlist from cards or the detail page.";
  const title = tabs.find((tab) => tab.id === activeTab)?.label ?? "Library";

  return (
    <section id="library" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8">
      <span id="watchlist" className="block scroll-mt-28" />
      <span id="wishlist" className="block scroll-mt-28" />
      <div className="glass-panel rounded-[30px] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cine-red">Personal Library</p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Watchlist and Wishlist</h2>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex h-11 flex-none items-center gap-2 rounded-full px-4 text-sm font-black transition ${
                  activeTab === tab.id ? "bg-cine-red text-white shadow-glow" : "glass-button text-white/66 hover:bg-white/[0.08] hover:text-white"
                }`}
                aria-label={`Show ${tab.label}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-white/55">{tabs.find((tab) => tab.id === activeTab)?.description}</p>
      </div>

      <MovieRow id={`library-${activeTab}`} title={title} movies={activeMovies} loading={false} emptyMessage={emptyMessage} onOpen={onOpen} wishlistIds={wishlistIds} onToggleWishlist={onToggleWishlist} />
    </section>
  );
}
