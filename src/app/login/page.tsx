import React from 'react'
import LoginPage from '../components/LoginPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accedi',
  robots: { index: false, follow: false },
}

/**
 * The default export for the login page route.
 * Renders the <LoginPage /> component.
 *
 * @returns {JSX.Element} The login page component.
 */
export default function page() {
  return (
    <LoginPage />
  )
}
