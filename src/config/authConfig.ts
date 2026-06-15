import 'dotenv/config';

interface AuthConfig {
  apiToken: string;
}

export const authConfig: AuthConfig = {
  apiToken: process.env.API_TOKEN ?? '',
};
