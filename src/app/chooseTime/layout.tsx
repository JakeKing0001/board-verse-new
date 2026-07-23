import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tempo di gioco',
  robots: { index: false, follow: false },
};

export default function ChooseTimeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
