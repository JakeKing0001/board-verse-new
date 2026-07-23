import type { Metadata } from 'next';
import Challenge from '../components/Challenge';

export const metadata: Metadata = {
  title: 'Challenge',
  description: 'Allenati con puzzle tattici di difficoltà crescente.',
};

export default function ChallengePage() {
  return <Challenge />;
}
