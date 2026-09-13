import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: 'ResolveOS | Autonomous Customer Resolution Platform',
  description: 'Verifiable, safe, and adaptive AI customer resolution platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fffefb] text-[#201515] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>

    </html>
  );
}
