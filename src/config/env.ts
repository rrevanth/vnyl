import Constants from 'expo-constants';

/**
 * Environment Configuration
 *
 * Centralized configuration for all environment variables used in the VNYL app.
 * All variables must be prefixed with EXPO_PUBLIC_ to be available in the client.
 */

interface EnvConfig {
  // TMDB Configuration
  tmdb: {
    baseUrl: string;
    apiKey: string;
  };

  // Trakt Configuration
  trakt: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };

  // MDBList Configuration
  mdblist: {
    baseUrl: string;
    apiKey: string;
  };

  // Fanart.tv Configuration
  fanart: {
    baseUrl: string;
    apiKey: string;
  };

  // Expo/EAS Configuration
  expo: {
    projectId: string;
  };

  // Error Tracking Configuration
  sentry: {
    dsn: string;
  };

  // Environment Info
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get environment variable with type safety and validation
 */
function getEnvVar(key: string, required: boolean = true): string {
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];

  if (required && !value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value || '';
}

/**
 * Centralized environment configuration
 */
export const env: EnvConfig = {
  tmdb: {
    baseUrl: getEnvVar('EXPO_PUBLIC_TMDB_BASE_URL'),
    apiKey: getEnvVar('EXPO_PUBLIC_TMDB_API_KEY'),
  },

  trakt: {
    clientId: getEnvVar('EXPO_PUBLIC_TRAKT_CLIENT_ID'),
    clientSecret: getEnvVar('EXPO_PUBLIC_TRAKT_CLIENT_SECRET'),
    redirectUri: getEnvVar('EXPO_PUBLIC_TRAKT_REDIRECT_URI'),
  },

  mdblist: {
    baseUrl: getEnvVar('EXPO_PUBLIC_MDBLIST_BASE_URL'),
    apiKey: getEnvVar('EXPO_PUBLIC_MDBLIST_API_KEY'),
  },

  fanart: {
    baseUrl: getEnvVar('EXPO_PUBLIC_FANART_BASE_URL'),
    apiKey: getEnvVar('EXPO_PUBLIC_FANART_API_KEY'),
  },

  expo: {
    projectId: getEnvVar('EXPO_PUBLIC_PROJECT_ID'),
  },

  sentry: {
    dsn: getEnvVar('EXPO_PUBLIC_SENTRY_DSN'),
  },

  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

/**
 * Validate that all required environment variables are set
 */
export function validateEnv(): void {
  const requiredVars = [
    'EXPO_PUBLIC_TMDB_BASE_URL',
    'EXPO_PUBLIC_TMDB_API_KEY',
    'EXPO_PUBLIC_TRAKT_CLIENT_ID',
    'EXPO_PUBLIC_TRAKT_CLIENT_SECRET',
    'EXPO_PUBLIC_TRAKT_REDIRECT_URI',
    'EXPO_PUBLIC_MDBLIST_BASE_URL',
    'EXPO_PUBLIC_MDBLIST_API_KEY',
    'EXPO_PUBLIC_FANART_BASE_URL',
    'EXPO_PUBLIC_FANART_API_KEY',
    'EXPO_PUBLIC_PROJECT_ID',
    'EXPO_PUBLIC_SENTRY_DSN',
  ];

  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    try {
      getEnvVar(varName);
    } catch {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file and ensure all variables are set.'
    );
  }
}

/**
 * API endpoints helper
 */
export const apiEndpoints = {
  tmdb: {
    movie: (id: number) => `${env.tmdb.baseUrl}/movie/${id}?api_key=${env.tmdb.apiKey}`,
    tv: (id: number) => `${env.tmdb.baseUrl}/tv/${id}?api_key=${env.tmdb.apiKey}`,
    search: (query: string, type: 'movie' | 'tv' = 'movie') =>
      `${env.tmdb.baseUrl}/search/${type}?api_key=${env.tmdb.apiKey}&query=${encodeURIComponent(query)}`,
    trending: (type: 'movie' | 'tv' = 'movie', timeWindow: 'day' | 'week' = 'day') =>
      `${env.tmdb.baseUrl}/trending/${type}/${timeWindow}?api_key=${env.tmdb.apiKey}`,
  },

  trakt: {
    movies: `https://api.trakt.tv/movies/trending`,
    shows: `https://api.trakt.tv/shows/trending`,
    user: (username: string) => `https://api.trakt.tv/users/${username}`,
  },

  mdblist: {
    movie: (imdbId: string) => `${env.mdblist.baseUrl}/movie/${imdbId}?apikey=${env.mdblist.apiKey}`,
    tv: (imdbId: string) => `${env.mdblist.baseUrl}/tv/${imdbId}?apikey=${env.mdblist.apiKey}`,
  },

  fanart: {
    movie: (tmdbId: number) => `${env.fanart.baseUrl}/movies/${tmdbId}?api_key=${env.fanart.apiKey}`,
    tv: (tvdbId: number) => `${env.fanart.baseUrl}/tv/${tvdbId}?api_key=${env.fanart.apiKey}`,
  },
};