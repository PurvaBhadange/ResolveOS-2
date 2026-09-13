import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

const authOptions = {
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

    // Staff & Customer Credentials / Registration Provider
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
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role || 'customer';
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = token.role;
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
