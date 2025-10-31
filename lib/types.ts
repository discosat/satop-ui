// SessionPayload for Auth0 sessions
export interface SessionPayload {
  user: {
    sub: string;
    name: string;
    email: string;
    picture?: string;
  };
  accessToken?: string;
}

// Helper to convert Auth0 Session to our SessionPayload
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toSessionPayload(session: any): SessionPayload | null {
  if (!session) return null;
  
  // Note: Auth0 uses 'accessToken' not 'access_token' in tokenSet
  const accessToken = session.tokenSet?.accessToken;
  
  return {
    user: {
      sub: session.user.sub,
      name: session.user.name || "",
      email: session.user.email || "",
      picture: session.user.picture,
    },
    accessToken,
  };
}