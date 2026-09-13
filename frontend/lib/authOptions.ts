import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Ensure NEXTAUTH_URL dynamically detects Vercel deployment if unset or set to localhost
if (process.env.VERCEL_URL) {
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes('localhost')) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
}

// Resolve Google OAuth credentials with multiple standard environment variable fallbacks
const googleClientId =
  process.env.AUTH_GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_ID ||
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID ||
  '';

const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.GOOGLE_SECRET ||
  '';

export const authOptions: NextAuthOptions = {
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    // Google OAuth 2.0 Provider
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                prompt: 'select_account',
                access_type: 'offline',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),

    // Staff & Customer Credentials / Instant Role Provider
    CredentialsProvider({
      name: 'ResolveOS Account',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email.toLowerCase();
        const name =
          credentials.name ||
          (email.includes('ops')
            ? 'Operations Lead'
            : email.includes('admin')
            ? 'Admin Supervisor'
            : email.includes('agent')
            ? 'Support Agent Tier 2'
            : email.split('@')[0]);

        const role =
          credentials.role ||
          (email.includes('ops')
            ? 'operations'
            : email.includes('admin')
            ? 'admin'
            : email.includes('agent')
            ? 'support_agent'
            : 'customer');

        return {
          id: String(Date.now()),
          name: name,
          email: email,
          role: role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      // First-time sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role =
          user.role ||
          (user.email?.toLowerCase().includes('admin')
            ? 'admin'
            : user.email?.toLowerCase().includes('ops')
            ? 'operations'
            : user.email?.toLowerCase().includes('agent')
            ? 'support_agent'
            : 'customer');
      }

      if (account?.provider === 'google') {
        token.provider = 'google';
        if (profile?.picture) {
          token.picture = profile.picture;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role || 'customer';
        (session.user as any).provider = token.provider || 'credentials';
        if (token.picture) {
          (session.user as any).image = token.picture;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'resolveos_secure_production_secret_32_characters_key_hash',
};
