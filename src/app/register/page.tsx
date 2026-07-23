import React from 'react'
import RegisterPage from '../components/RegisterPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrati',
  description: 'Crea il tuo account BoardVerse.',
}

/**
 * The default export for the register page route.
 * Renders the <RegisterPage /> component.
 *
 * @returns {JSX.Element} The rendered registration page component.
 */
export default function page() {
  return (
    <RegisterPage />
  )
}
