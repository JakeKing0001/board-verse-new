import React, { Suspense} from 'react';
import ResetPasswordPage from '../components/ResetPasswordPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading reset form…</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}