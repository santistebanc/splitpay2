type PostgrestErrorLike = {
  code?: string;
  message?: string;
};

/** True when Supabase/PostgREST reports a duplicate primary key. */
export function isDuplicateKeyError(error: PostgrestErrorLike | null): boolean {
  if (!error) {
    return false;
  }

  return error.code === "23505";
}
