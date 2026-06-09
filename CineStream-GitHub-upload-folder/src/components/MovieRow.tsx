import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left.js";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.js";
import { useRef } from "react";
import type { Movie } from "../types";
import { MovieCard } from "./MovieCard";

type MovieRowProps = {
  id: string;
  title: string;
  movies: Movie[];
  loading?: boolean;
  emptyMessage?: string;
  onOpen: (movie: Movie) => void;
  wishlistIds?: Set<number>;
  onToggleWishlist?: (movie: Movie) => void;
};

export function MovieRow({ id, title, movies, loading = false, emptyMessage = "No movies found.", onOpen, wishlistIds, onToggleWishlist }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const node = rowRef.current;
    if (!node) return;
    node.scrollBy({ left: direction === "right" ? node.clientWidth * 0.85 : -node.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section id={id} className="group/row relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="text-lg font-black text-white sm:text-2xl">{title}</h2>
        <div className="hidden items-center gap-2 opacity-100 transition md:flex md:opacity-0 md:group-hover/row:opacity-100">
          <button
            onClick={() => scroll("left")}
            className="glass-button grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/20 active:scale-95"
            aria-label={`Scroll ${title} left`}
            title="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="glass-button grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/20 active:scale-95"
            aria-label={`Scroll ${title} right`}
            title="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="movie-row-mask movie-row-snap no-scrollbar flex min-h-[204px] gap-3 overflow-x-auto scroll-smooth pb-5 pt-2 sm:min-h-[252px] sm:gap-4 md:min-h-[300px] lg:min-h-[324px]"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <MovieSkeleton key={`${id}-skeleton-${index}`} />)
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpen={onOpen} isWishlisted={wishlistIds?.has(movie.id)} onToggleWishlist={onToggleWishlist} />)}
        {!loading && movies.length === 0 ? (
          <div className="glass-panel grid min-h-[190px] w-full place-items-center rounded-[28px] px-6 text-center text-sm text-white/62 sm:min-h-[240px]">
            {emptyMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MovieSkeleton() {
  return (
    <div className="glass-card relative aspect-[2/3] w-32 flex-none overflow-hidden rounded-[26px] sm:w-40 md:w-48 lg:w-52">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/12 to-transparent" />
    </div>
  );
}
