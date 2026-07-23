import Statistics from '../components/Statistics';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statistiche',
  description: 'Analizza partite, risultati, attività e progressi su BoardVerse.',
};

export default function Page() {
  return <Statistics />;
}
