import React, { Suspense} from 'react';
import ResetPasswordPage from '../components/ResetPasswordPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reimposta password',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading reset form…</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
