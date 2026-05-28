import Bell from "lucide-react/dist/esm/icons/bell.js";
import Info from "lucide-react/dist/esm/icons/info.js";
import type { TouchEvent, WheelEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { imageUrl } from "../api/tmdb";
import type { UiText } from "../i18n";
import type { Movie } from "../types";
import { formatDate, languageName } from "../utils/movieFormat";

type HeroBannerProps = {
  movies: Movie[];
  onOpen: (movie: Movie) => void;
  text: UiText;
};

const SLIDE_MS = 10000;

export function HeroBanner({ movies, onOpen, text }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<Set<number>>(() => new Set());
  const touchStartX = useRef<number | null>(null);
  const lastWheelAt = useRef(0);
  const sliderMovies = movies.slice(0, 15);
  const movie = sliderMovies[activeIndex];
  const isNotified = movie ? notifiedIds.has(movie.id) : false;

  useEffect(() => {
    if (activeIndex >= sliderMovies.length) setActiveIndex(0);
  }, [activeIndex, sliderMovies.length]);

  useEffect(() => {
    if (paused || sliderMovies.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % sliderMovies.length);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [sliderMovies.length, paused]);

  useEffect(() => {
    if (sliderMovies.length < 2) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        Boolean(target?.isContentEditable);

      if (isTyping || document.querySelector('[role="dialog"]')) return;

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % sliderMovies.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + sliderMovies.length) % sliderMovies.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sliderMovies.length]);

  function goToNext() {
    if (!sliderMovies.length) return;
    setActiveIndex((current) => (current + 1) % sliderMovies.length);
  }

  function goToPrevious() {
    if (!sliderMovies.length) return;
    setActiveIndex((current) => (current - 1 + sliderMovies.length) % sliderMovies.length);
  }

  function handleNotify(movieId: number) {
    setNotifiedIds((current) => {
      const next = new Set(current);
      next.add(movieId);
      return next;
    });
  }

  function handleWheel(event: WheelEvent<HTMLElement>) {
    if (sliderMovies.length < 2) return;

    const now = Date.now();
    if (now - lastWheelAt.current < 720) return;

    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 24) return;

    event.preventDefault();
    lastWheelAt.current = now;
    if (dominantDelta > 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null || sliderMovies.length < 2) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = touchStartX.current - touchEndX;
    touchStartX.current = null;

    if (Math.abs(distance) < 44) return;
    if (distance > 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  }

  if (!movie) {
    return (
      <section className="min-h-[76vh] bg-gradient-to-br from-zinc-950 via-zinc-900 to-black pt-36 sm:min-h-[82vh] sm:pt-40">
        <div className="mx-auto max-w-7xl animate-pulse px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-44 rounded-full bg-white/10" />
          <div className="mt-8 h-16 max-w-xl rounded-[28px] bg-white/10 sm:h-24" />
          <div className="mt-4 h-24 max-w-2xl rounded-[28px] bg-white/10" />
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-36 rounded-full bg-white/10" />
            <div className="h-12 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex min-h-[72vh] touch-pan-y items-end overflow-hidden bg-black pb-10 pt-32 sm:min-h-[82vh] sm:pb-16 sm:pt-40 lg:min-h-[88vh] lg:pb-20 lg:pt-44"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {sliderMovies.map((slideMovie, index) => (
        <div
          key={slideMovie.id}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out ${
            index === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-[1.035]"
          }`}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(4,4,7,0.96) 0%, rgba(4,4,7,0.78) 36%, rgba(4,4,7,0.22) 72%), linear-gradient(0deg, #050505 0%, rgba(5,5,5,0.54) 24%, rgba(5,5,5,0.04) 72%), url(${imageUrl(slideMovie.backdrop_path || slideMovie.poster_path, "original")})`
          }}
          aria-hidden={index !== activeIndex}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_35%,rgba(229,9,20,0.2),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,transparent_24%,rgba(0,0,0,0.68)_100%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <div key={`${movie.id}-copy`} className="max-w-3xl animate-[heroContent_650ms_ease]">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
              <p className="inline-flex items-center rounded-full bg-cine-red/92 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-glow ring-1 ring-white/16 sm:text-xs">
                Upcoming Movies
              </p>
              <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black text-white/76 ring-1 ring-white/14 backdrop-blur">
                {String(activeIndex + 1).padStart(2, "0")} / {String(sliderMovies.length).padStart(2, "0")}
              </span>
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-[0.96] text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">{movie.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/82">
              {movie.release_date ? <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/14 backdrop-blur">{formatDate(movie.release_date)}</span> : null}
              {movie.original_language ? <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/12 backdrop-blur">{languageName(movie.original_language)}</span> : null}
              {movie.vote_average > 0 ? <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/12 backdrop-blur">{movie.vote_average.toFixed(1)} {text.rating}</span> : null}
            </div>
            <p className="mt-6 line-clamp-4 max-w-2xl text-sm leading-6 text-white/84 sm:text-lg sm:leading-8">{movie.overview || text.noOverview}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => handleNotify(movie.id)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-black shadow-xl transition hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/85 active:translate-y-0"
                aria-label={`Notify me about ${movie.title}`}
              >
                <Bell size={18} fill={isNotified ? "currentColor" : "none"} />
                {isNotified ? "Reminder Set" : "Notify Me"}
              </button>
              <button
                onClick={() => onOpen(movie)}
                className="glass-button inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/22 active:translate-y-0"
                aria-label={`More information about ${movie.title}`}
              >
                <Info size={18} />
                {text.moreInfo}
              </button>
            </div>
          </div>

          <button
            key={`${movie.id}-poster`}
            onClick={() => onOpen(movie)}
            className="glass-card group hidden aspect-[2/3] overflow-hidden rounded-[32px] text-left shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-cine-red/45 hover:shadow-glow lg:block"
            aria-label={`Open ${movie.title}`}
          >
            {movie.poster_path ? (
              <img src={imageUrl(movie.poster_path, "w500")} alt={movie.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            ) : (
              <div className="grid h-full place-items-center bg-white/[0.06] px-5 text-center text-white/68">{movie.title}</div>
            )}
          </button>
        </div>

        {sliderMovies.length > 1 ? (
          <div className="mt-5 flex items-center gap-2 sm:mt-8">
            <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur-xl">
              {sliderMovies.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition ${index === activeIndex ? "w-7 bg-cine-red shadow-glow sm:w-9" : "w-2 bg-white/35 hover:bg-white/70"}`}
                  aria-label={`Show hero movie ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
