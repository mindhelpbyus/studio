import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:9002'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Nexus'),
  
  // Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  
  // External Services
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  ANALYTICS_ID: z.string().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_PWA: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_OFFLINE: z.coerce.boolean().default(false),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'));
      
      const invalidVars = error.errors
        .filter(err => err.code !== 'invalid_type' || err.received !== 'undefined')
        .map(err => `${err.path.join('.')}: ${err.message}`);

      let errorMessage = 'Environment validation failed:\n';
      
      if (missingVars.length > 0) {
        errorMessage += `\nMissing required variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}`;
      }
      
      if (invalidVars.length > 0) {
        errorMessage += `\nInvalid variables:\n${invalidVars.map(v => `  - ${v}`).join('\n')}`;
      }

      throw new Error(errorMessage);
    }
    throw error;
  }
}

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Feature flags
export const features = {
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  pwa: env.NEXT_PUBLIC_ENABLE_PWA,
  offline: env.NEXT_PUBLIC_ENABLE_OFFLINE,
} as const;

// Database configuration
export const database = {
  url: env.DATABASE_URL,
  redis: env.REDIS_URL,
} as const;

// External services configuration
export const services = {
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
  },
  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    s3Bucket: env.AWS_S3_BUCKET,
  },
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    analyticsId: env.ANALYTICS_ID,
  },
} as const;

// Validate environment on module load in development
if (isDevelopment) {
  console.log('✅ Environment variables validated successfully');
}