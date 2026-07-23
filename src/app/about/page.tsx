import type { Metadata } from 'next'
import React from 'react'
import AboutPage from '../components/About'

export const metadata: Metadata = {
  title: 'Chi siamo',
  description: 'Scopri la storia, la missione e i valori di BoardVerse.',
}

/**
 * Renders the About page component.
 *
 * @returns The JSX element for the About page.
 */
export default function page() {
  return (
    <AboutPage />
  )
}
