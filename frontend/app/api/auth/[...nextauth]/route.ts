import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    // Google OAuth Provider
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),

    // Local Credentials Provider for Staff & Demo Testing
    CredentialsProvider({
      name: 'ResolveOS Staff Account',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@resolveos.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Mock authentication check for demo roles
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
  secret: process.env.AUTH_SECRET || 'resolveos_dev_secret_key_32_characters_minimum_len',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
