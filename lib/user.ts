import { SessionPayload } from "./session";


export function hasScope(session: SessionPayload | null, requiredScope: string): boolean {
  if (!session?.scopes) {
    return false;
  }

  return session.scopes.some(userScope => {
    // User has a universal wildcard. Access is always granted.
    if (userScope === '*') {
      return true;
    }

    // User has a partial wildcard (e.g., "scheduling.*")
    if (userScope.endsWith('*')) {
      const prefix = userScope.slice(0, -1);
      return requiredScope.startsWith(prefix);
    }

    // User has the exact scope.
    return userScope === requiredScope;
  });
}