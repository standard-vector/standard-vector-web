/** Minimal className joiner — keeps the dependency footprint at zero. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
