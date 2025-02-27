import { SessionPayload } from "./session";

export function hasScope(session: SessionPayload | null, scope: string) {
  return session?.scopes.includes(scope) ?? false;
}
