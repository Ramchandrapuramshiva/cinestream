import Heart from "lucide-react/dist/esm/icons/heart.js";
import Star from "lucide-react/dist/esm/icons/star.js";
import { imageUrl } from "../api/tmdb";
import type { Movie } from "../types";

type MovieCardProps = {
  movie: Movie;
  onOpen: (movie: Movie) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (movie: Movie) => void;
};

export function MovieCard({ movie, onOpen, isWishlisted = false, onToggleWishlist }: MovieCardProps) {
  return (
    <article
      className="glass-card group relative aspect-[2/3] w-32 flex-none overflow-hidden rounded-[26px] text-left transition duration-300 hover:z-10 hover:-translate-y-2 hover:scale-[1.045] hover:border-cine-red/45 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-cine-red sm:w-40 md:w-48 lg:w-52"
    >
      {movie.poster_path ? (
        <img
          src={imageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-white/[0.06] px-4 text-center text-sm text-white/60">
          {movie.title}
        </div>
      )}
      <button className="absolute inset-0 z-10" onClick={() => onOpen(movie)} aria-label={`Open ${movie.title}`}>
        <span className="sr-only">Open {movie.title}</span>
      </button>
      {onToggleWishlist ? (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleWishlist(movie);
          }}
          className={`absolute right-2 top-2 z-20 grid h-9 w-9 place-items-center rounded-full text-white shadow-xl backdrop-blur transition hover:scale-105 ${
            isWishlisted ? "bg-cine-red ring-1 ring-cine-red/70" : "bg-black/55 ring-1 ring-white/16 hover:bg-white/18"
          }`}
          aria-label={isWishlisted ? `Remove ${movie.title} from wishlist` : `Add ${movie.title} to wishlist`}
          title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
        >
          <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-45 transition group-hover:opacity-90" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-3 opacity-100 transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <h3 className="line-clamp-2 text-sm font-bold text-white">{movie.title}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-yellow-300">
          <Star size={13} fill="currentColor" />
          {movie.vote_average.toFixed(1)}
        </div>
      </div>
    </article>
  );
}
