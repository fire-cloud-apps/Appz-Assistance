export const authConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN ?? 'auth-service-fc-srg.eu.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? 'YOUR_AUTH0_CLIENT_ID',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE ?? '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  roleClaim:
    import.meta.env.VITE_AUTH0_ROLE_CLAIM ?? 'https://appz/roles',
  redirectUri: import.meta.env.VITE_AUTH0_REDIRECT_URI ?? window.location.origin,
  scope: import.meta.env.VITE_AUTH0_SCOPE ?? 'openid profile email',
  apiScope: import.meta.env.VITE_AUTH0_API_SCOPE ?? '',
}

export const isAuthConfigured =
  Boolean(authConfig.domain && authConfig.clientId) &&
  authConfig.clientId !== 'YOUR_AUTH0_CLIENT_ID'
