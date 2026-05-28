import type { SupabaseUser } from "./supabase";
import { supabase } from "./supabase";
import type { Movie } from "../types";

export type LibraryTable = "wishlist" | "watchlist";

type LibraryRow = {
  movie: Movie | null;
};

export async function upsertProfile(user: SupabaseUser) {
  if (!supabase) return;

  const metadata = user.user_metadata ?? {};
  await supabase.from("profiles").upsert(
    {
      avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
      email: user.email ?? null,
      full_name: metadata.full_name ?? metadata.name ?? null,
      id: user.id,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
}

export async function loadCloudMovies(table: LibraryTable, userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(table)
    .select("movie")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as LibraryRow[] | null) ?? []).map((row) => row.movie).filter(Boolean) as Movie[];
}

export async function upsertCloudMovie(table: LibraryTable, userId: string, movie: Movie) {
  if (!supabase) return;

  const { error } = await supabase.from(table).upsert(
    {
      movie: toJsonMovie(movie),
      movie_id: movie.id,
      user_id: userId
    },
    { onConflict: "user_id,movie_id" }
  );

  if (error) throw error;
}

export async function removeCloudMovie(table: LibraryTable, userId: string, movieId: number) {
  if (!supabase) return;

  const { error } = await supabase.from(table).delete().eq("user_id", userId).eq("movie_id", movieId);
  if (error) throw error;
}

export async function syncLocalMoviesToCloud(table: LibraryTable, userId: string, movies: Movie[]) {
  if (!supabase || !movies.length) return;

  const rows = movies.map((movie) => ({
    movie: toJsonMovie(movie),
    movie_id: movie.id,
    user_id: userId
  }));

  const { error } = await supabase.from(table).upsert(rows, { onConflict: "user_id,movie_id" });
  if (error) throw error;
}

function toJsonMovie(movie: Movie) {
  return JSON.parse(JSON.stringify(movie)) as Movie;
}
