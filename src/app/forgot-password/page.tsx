import React from 'react'
import ForgotPasswordPage from '../components/ForgotPasswordPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Password dimenticata',
  robots: { index: false, follow: false },
}

/**
 * Renders the Forgot Password page component.
 *
 * This is the default export for the forgot password route.
 * It displays the <ForgotPasswordPage /> component, which handles
 * the password reset functionality for users who have forgotten their password.
 *
 * @returns {JSX.Element} The Forgot Password page component.
 */
export default function page() {
  return (
    <ForgotPasswordPage />
  )
}
