import Calendar from "lucide-react/dist/esm/icons/calendar.js";
import Clapperboard from "lucide-react/dist/esm/icons/clapperboard.js";
import Clock from "lucide-react/dist/esm/icons/clock.js";
import Globe2 from "lucide-react/dist/esm/icons/globe-2.js";
import Heart from "lucide-react/dist/esm/icons/heart.js";
import ImageIcon from "lucide-react/dist/esm/icons/image.js";
import IndianRupee from "lucide-react/dist/esm/icons/indian-rupee.js";
import MessageSquare from "lucide-react/dist/esm/icons/message-square.js";
import Play from "lucide-react/dist/esm/icons/play.js";
import Share2 from "lucide-react/dist/esm/icons/share-2.js";
import Star from "lucide-react/dist/esm/icons/star.js";
import Users from "lucide-react/dist/esm/icons/users.js";
import X from "lucide-react/dist/esm/icons/x.js";
import { useEffect, useMemo, useState } from "react";
import { getMovieBundle, imageUrl } from "../api/tmdb";
import type { UiText } from "../i18n";
import type { Credit, Movie, MovieBundle, MovieImage, WatchProvider } from "../types";
import { formatDate, formatINR, formatRuntime, getSafeMoneyValue, languageName, notAvailable, usdToINR } from "../utils/movieFormat";
import { MovieCard } from "./MovieCard";

type MovieModalProps = {
  movie: Movie | null;
  onClose: () => void;
  onSelect: (movie: Movie) => void;
  isWatchlisted: boolean;
  isWishlisted: boolean;
  wishlistIds: Set<number>;
  onToggleWatchlist: (movie: Movie) => void;
  onToggleWishlist: (movie: Movie) => void;
  text: UiText;
};

export function MovieModal({ movie, onClose, onSelect, isWatchlisted, isWishlisted, wishlistIds, onToggleWatchlist, onToggleWishlist, text }: MovieModalProps) {
  const [bundle, setBundle] = useState<MovieBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trailerStarted, setTrailerStarted] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (!movie) return;

    let cancelled = false;
    setBundle(null);
    setError(null);
    setTrailerStarted(false);
    setShareMessage("");

    void getMovieBundle(movie.id)
      .then((data) => {
        if (!cancelled) setBundle(data);
      })
      .catch(() => {
        if (!cancelled) setError(text.detailsUnavailable);
      });

    return () => {
      cancelled = true;
    };
  }, [movie, text.detailsUnavailable]);

  useEffect(() => {
    if (!movie) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [movie, onClose]);

  const hero = useMemo(() => findHero(bundle), [bundle]);
  const heroine = useMemo(() => findHeroine(bundle), [bundle]);

  if (!movie) return null;

  const detailRecord = bundle?.details;
  const details = detailRecord ?? movie;
  const posters = bundle?.posters ?? [];
  const backdrops = bundle?.backdrops ?? [];
  const trailer = bundle?.trailer;
  const iframeSrc = trailer?.key?.trim() ? `https://www.youtube.com/embed/${trailer.key.trim()}` : "";
  const fallback = bundle?.fallback;
  const language = fallback?.language ?? languageName(details.original_language);
  const releaseDate = formatDate(details.release_date || fallback?.releaseDate);
  const story = details.overview || fallback?.story || text.noOverview;
  const recommendations = bundle?.recommendations.length ? bundle.recommendations : bundle?.similar ?? [];
  const runtime = detailRecord?.runtime;
  const genres = detailRecord?.genres ?? [];
  const budget = getSafeMoneyValue(detailRecord?.budget);
  const revenue = getSafeMoneyValue(detailRecord?.revenue);
  const watchProviders = bundle?.watchProviders ?? { stream: [], rent: [], buy: [] };
  const hasWatchProviders = Boolean(watchProviders.stream.length || watchProviders.rent.length || watchProviders.buy.length);
  const showOttAvailability = !isFutureRelease(details.release_date);

  async function shareMovie() {
    const shareData = {
      title: details.title,
      text: story,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Shared");
      } else {
        await navigator.clipboard.writeText(`${details.title} - ${window.location.href}`);
        setShareMessage("Link copied");
      }
    } catch {
      setShareMessage("Share unavailable");
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/78 p-0 backdrop-blur-xl sm:p-4 lg:p-6" role="dialog" aria-modal="true">
      <div className="glass-panel mx-auto min-h-screen max-w-6xl overflow-hidden shadow-2xl sm:min-h-0 sm:rounded-[36px]">
        <div
          className="relative bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(12,12,14,0.96), rgba(12,12,14,0.78) 42%, rgba(12,12,14,0.32)), linear-gradient(0deg, #0c0c0e 0%, rgba(12,12,14,0.2) 55%), url(${imageUrl(details.backdrop_path, "original") || imageUrl(details.poster_path, "original")})`
          }}
        >
          <button
            onClick={onClose}
            className="glass-button absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full text-white shadow-xl transition hover:scale-105 hover:bg-white/18"
            aria-label={text.close}
            title={text.close}
          >
            <X size={20} />
          </button>

          <div className="grid gap-6 px-5 pb-8 pt-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pb-10 lg:pt-24">
            <div className="max-w-sm">
              <div className="glass-card overflow-hidden rounded-[28px] shadow-2xl">
                {details.poster_path ? (
                  <img src={imageUrl(details.poster_path, "w500")} alt={details.title} decoding="async" className="aspect-[2/3] w-full object-cover" />
                ) : (
                  <div className="grid aspect-[2/3] place-items-center bg-white/[0.06] px-5 text-center text-white/60">{details.title}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <p className="mb-3 inline-flex w-fit items-center rounded-full bg-cine-red px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-glow">
                {detailRecord?.status || "Movie Details"}
              </p>
              <h2 className="text-4xl font-black leading-none text-white sm:text-5xl lg:text-6xl">{details.title}</h2>
              {detailRecord?.tagline ? <p className="mt-3 text-lg font-semibold italic text-white/65">{detailRecord.tagline}</p> : null}
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-white/80">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-300 px-3 py-1.5 text-black shadow-xl">
                  <Star size={14} fill="currentColor" />
                  IMDb-style {details.vote_average.toFixed(1)}/10
                </span>
                <Badge icon={<Calendar size={14} />} value={releaseDate} />
                <Badge icon={<Clock size={14} />} value={formatRuntime(runtime)} />
                <Badge icon={<Globe2 size={14} />} value={language} />
              </div>
              <p className="mt-5 line-clamp-4 max-w-3xl text-base leading-7 text-white/78">{story}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton active={isWishlisted} onClick={() => onToggleWishlist(details)} icon={<Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />} label={isWishlisted ? "In Wishlist" : "Add to Wishlist"} />
                <ActionButton active={isWatchlisted} onClick={() => onToggleWatchlist(details)} icon={<Play size={18} fill={isWatchlisted ? "currentColor" : "none"} />} label={isWatchlisted ? "In Watchlist" : "Add to Watchlist"} />
                <ActionButton onClick={() => void shareMovie()} icon={<Share2 size={18} />} label={shareMessage || "Share Movie"} />
              </div>
            </div>
          </div>
        </div>

        {!bundle && !error ? <DetailSkeleton /> : null}

        {bundle || error ? (
          <div className="space-y-9 px-5 py-7 sm:px-8 lg:px-10">
            <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <Panel title={text.trailer} icon={<Clapperboard size={18} />}>
                <div className="glass-card h-[210px] overflow-hidden rounded-[28px] bg-black/60 sm:h-[280px] lg:h-[360px]">
                  {iframeSrc && trailerStarted ? (
                    <iframe
                      src={iframeSrc}
                      title="Movie trailer"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="h-full w-full"
                    />
                  ) : iframeSrc ? (
                    <button
                      onClick={() => setTrailerStarted(true)}
                      className="relative grid h-full w-full place-items-center overflow-hidden text-white"
                      aria-label={`Play trailer for ${details.title}`}
                    >
                      {details.backdrop_path || details.poster_path ? <img src={imageUrl(details.backdrop_path || details.poster_path, "w780")} alt={`${details.title} trailer preview`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-58" /> : null}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/35 to-black/10" />
                      <span className="relative inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-black text-black shadow-2xl transition hover:scale-105">
                        <Play size={18} fill="currentColor" />
                        Play Trailer
                      </span>
                    </button>
                  ) : (
                    <div className="relative grid h-full place-items-center overflow-hidden px-6 text-center text-white">
                      {details.backdrop_path || details.poster_path ? <img src={imageUrl(details.backdrop_path || details.poster_path, "w780")} alt={`${details.title} poster`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-36" /> : null}
                      <span className="absolute inset-0 bg-gradient-to-br from-black/84 via-black/54 to-cine-red/18" />
                      <div className="relative max-w-sm rounded-[28px] bg-white/[0.08] p-5 shadow-2xl ring-1 ring-white/14 backdrop-blur-xl">
                        <Clapperboard className="mx-auto mb-3 text-cine-red" size={28} />
                        <p className="text-base font-black text-white">Trailer not available for this movie</p>
                        <p className="mt-2 text-sm leading-6 text-white/58">We could not find a playable YouTube trailer from TMDB.</p>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>

              <Panel title="Crew Details" icon={<Users size={18} />}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <CrewInfoLine label="Hero" value={fallback?.hero ?? hero?.name ?? notAvailable} person={hero} />
                  <CrewInfoLine label="Heroine" value={fallback?.heroine ?? heroine?.name ?? notAvailable} person={heroine} />
                  <CrewInfoLine label={text.director} value={fallback?.director ?? names(bundle?.directors)} person={bundle?.directors[0]} />
                  <CrewInfoLine label={text.producers} value={fallback?.producer ?? names(bundle?.producers)} person={bundle?.producers[0]} />
                  <CrewInfoLine label="Music Director" value={fallback?.musicDirector ?? names(bundle?.musicDirectors)} person={bundle?.musicDirectors[0]} />
                  <InfoLine label="Language" value={language} />
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <Panel title="Story" icon={<MessageSquare size={18} />}>
                <p className="text-base leading-7 text-white/78">{story}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoLine label="Genre" value={genres.map((genre) => genre.name).join(" / ") || notAvailable} />
                  <InfoLine label="Release Date" value={releaseDate} />
                  <InfoLine label="Runtime" value={formatRuntime(runtime)} />
                  <InfoLine label="Language" value={language} />
                </div>
              </Panel>

              <Panel title="Budget & Collections" icon={<IndianRupee size={18} />}>
                <div className="grid gap-3">
                  <InfoLine label="Budget (INR approx.)" value={formatINR(usdToINR(budget))} />
                  <InfoLine label="Box Office Collections (INR approx.)" value={formatINR(usdToINR(revenue))} />
                </div>
              </Panel>
            </section>

            {showOttAvailability ? (
              <Panel title="Available On" icon={<Globe2 size={18} />}>
                {hasWatchProviders ? (
                  <div className="space-y-5">
                    <ProviderGroup title="Stream" providers={watchProviders.stream} />
                    <ProviderGroup title="Rent" providers={watchProviders.rent} />
                    <ProviderGroup title="Buy" providers={watchProviders.buy} />
                  </div>
                ) : (
                  <EmptyMessage message="OTT availability is not available yet." />
                )}
              </Panel>
            ) : null}

            <Panel title="Top Billed Cast" icon={<Users size={18} />}>
              <HorizontalRail>
                {(bundle?.cast ?? []).length ? (
                  bundle!.cast.map((actor) => <CastCard key={actor.id} actor={actor} />)
                ) : (
                  <EmptyMessage message={text.notListed} />
                )}
              </HorizontalRail>
            </Panel>

            <Panel title="Media" icon={<ImageIcon size={18} />}>
              <div className="space-y-5">
                <MediaGroup title="Posters" images={posters} type="poster" />
                <MediaGroup title="Backdrops" images={backdrops} type="backdrop" />
              </div>
            </Panel>

            <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <Panel title="Social & Reviews" icon={<MessageSquare size={18} />}>
                {bundle?.reviews.length ? (
                  <div className="space-y-3">
                    {bundle.reviews.map((review) => (
                      <article key={review.id} className="glass-card rounded-[24px] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-black text-white">{review.author}</h4>
                          {review.author_details?.rating ? <span className="text-sm font-bold text-yellow-300">{review.author_details.rating}/10</span> : null}
                        </div>
                        <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/68">{review.content}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyMessage message="Reviews are not available yet for this movie." />
                )}
              </Panel>

              <Panel title="Keywords" icon={<Clapperboard size={18} />}>
                {bundle?.keywords.length ? (
                  <div className="flex flex-wrap gap-2">
                    {bundle.keywords.map((keyword) => (
                      <span key={keyword.id} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-white/72 ring-1 ring-white/12">
                        {keyword.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptyMessage message={text.notListed} />
                )}
              </Panel>
            </section>

            <Panel title="Similar Movies" icon={<Star size={18} />}>
              {recommendations.length ? (
                <HorizontalRail>
                  {recommendations.map((recommendation) => (
                    <MovieCard key={recommendation.id} movie={recommendation} onOpen={onSelect} isWishlisted={wishlistIds.has(recommendation.id)} onToggleWishlist={onToggleWishlist} />
                  ))}
                </HorizontalRail>
              ) : (
                <EmptyMessage message={text.noRecommendations} />
              )}
            </Panel>

            {error ? <p className="rounded bg-red-500/12 p-4 text-sm text-red-100">{error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="glass-panel rounded-[28px] p-4 sm:p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
        <span className="text-cine-red">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function ActionButton({ active = false, icon, label, onClick }: { active?: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition active:scale-95 ${
        active ? "bg-cine-red text-white shadow-glow hover:bg-red-600" : "glass-button text-white hover:bg-white/18"
      }`}
      aria-label={label}
    >
      {icon}
      {label}
    </button>
  );
}

function ProviderGroup({ title, providers }: { title: string; providers: WatchProvider[] }) {
  if (!providers.length) return null;

  return (
    <div>
      <h4 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-white/45">{title}</h4>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => (
          <ProviderChip key={provider.provider_id} provider={provider} />
        ))}
      </div>
    </div>
  );
}

function ProviderChip({ provider }: { provider: WatchProvider }) {
  return (
    <div className="glass-card inline-flex min-h-14 items-center gap-3 rounded-[22px] px-3 py-2 ring-1 ring-white/12 transition hover:-translate-y-0.5 hover:ring-cine-red/40">
      <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-2xl bg-white text-xs font-black text-black">
        {provider.logo_path ? (
          <img src={imageUrl(provider.logo_path, "w92")} alt={provider.provider_name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          provider.provider_name.slice(0, 1)
        )}
      </span>
      <span className="max-w-40 truncate text-sm font-black text-white/86" title={provider.provider_name}>
        {provider.provider_name}
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10">
      <div className="h-56 animate-pulse rounded-[28px] bg-white/[0.06]" />
      <div className="h-56 animate-pulse rounded-[28px] bg-white/[0.06]" />
    </div>
  );
}

function Badge({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 ring-1 ring-white/14 backdrop-blur">
      {icon}
      {value}
    </span>
  );
}

function InfoLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="glass-card rounded-[22px] p-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/38">{label}</p>
      <p className="mt-1 text-sm font-bold text-white/82">{value || notAvailable}</p>
    </div>
  );
}

function CrewInfoLine({ label, value, person }: { label: string; value?: string; person?: Credit }) {
  return (
    <div className="glass-card flex min-w-0 items-center gap-3 rounded-[22px] p-3">
      <div className="grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-full bg-white/[0.07] text-xs font-black text-white/45 ring-1 ring-white/18">
        {person?.profile_path ? (
          <img src={imageUrl(person.profile_path, "w185")} alt={person.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          initials(value)
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/38">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-white/82" title={value || notAvailable}>
          {value || notAvailable}
        </p>
      </div>
    </div>
  );
}

function HorizontalRail({ children }: { children: React.ReactNode }) {
  return <div className="movie-row-snap no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-3 pt-1 sm:gap-4">{children}</div>;
}

function CastCard({ actor }: { actor: Credit }) {
  return (
    <article className="glass-card w-36 flex-none overflow-hidden rounded-[24px] transition hover:-translate-y-1 hover:scale-[1.015] sm:w-40">
      {actor.profile_path ? (
        <img src={imageUrl(actor.profile_path, "w185")} alt={actor.name} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover" />
      ) : (
        <div className="grid aspect-[3/4] place-items-center bg-white/[0.05] px-3 text-center text-sm text-white/45">{actor.name}</div>
      )}
      <div className="p-3">
        <h4 className="line-clamp-2 text-sm font-black text-white">{actor.name}</h4>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">{actor.character || actor.job || notAvailable}</p>
      </div>
    </article>
  );
}

function MediaGroup({ title, images, type }: { title: string; images: MovieImage[]; type: "poster" | "backdrop" }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-white/45">{title}</h4>
      {images.length ? (
        <HorizontalRail>
          {images.map((image) => (
            <img
              key={image.file_path}
              src={imageUrl(image.file_path, type === "poster" ? "w342" : "w780")}
              alt={title}
              loading="lazy"
              decoding="async"
              className={`${type === "poster" ? "aspect-[2/3] w-32 sm:w-36" : "aspect-video w-64 sm:w-80"} flex-none rounded-[24px] object-cover shadow-xl ring-1 ring-white/14 transition hover:scale-[1.02] hover:ring-cine-red/45`}
            />
          ))}
        </HorizontalRail>
      ) : (
        <EmptyMessage message="No media is available yet." />
      )}
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return <div className="glass-card rounded-[24px] p-4 text-sm text-white/62">{message}</div>;
}

function names(people?: Credit[]) {
  return people?.length ? people.map((person) => person.name).join(", ") : notAvailable;
}

function initials(value?: string) {
  if (!value || value === notAvailable) return "?";
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isFutureRelease(releaseDate?: string) {
  if (!releaseDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = new Date(`${releaseDate}T00:00:00`);
  return !Number.isNaN(release.getTime()) && release > today;
}

function findHero(bundle: MovieBundle | null) {
  return bundle?.cast.find((actor) => actor.gender === 2) ?? bundle?.cast[0];
}

function findHeroine(bundle: MovieBundle | null) {
  return bundle?.cast.find((actor) => actor.gender === 1) ?? bundle?.cast[1];
}
