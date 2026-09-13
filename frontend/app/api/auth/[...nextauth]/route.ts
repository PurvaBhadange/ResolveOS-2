import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

export const authOptions = {
  providers: [
    // Google OAuth Provider (Active if credentials are present in env)
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),

    // Staff & Demo Credentials Provider
    CredentialsProvider({
      name: 'ResolveOS Staff Account',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@resolveos.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        if (credentials.email.includes('ops')) {
          return { id: '2', name: 'Operations Lead', email: 'ops@resolveos.com', role: 'operations' };
        } else if (credentials.email.includes('admin')) {
          return { id: '1', name: 'Admin Supervisor', email: 'admin@resolveos.com', role: 'admin' };
        } else {
          return { id: '3', name: 'Support Agent Tier 2', email: 'agent@resolveos.com', role: 'support_agent' };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role || 'operations';
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'resolveos_dev_secret_key_32_characters_minimum_len',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
