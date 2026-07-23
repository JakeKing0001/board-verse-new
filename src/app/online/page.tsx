import React from 'react'
import OnlinePage from '../components/OnlinePage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partite online',
  description: 'Crea una partita pubblica o privata e gioca online.',
}

/**
 * Renders the main page component for the online section.
 *
 * @returns The `OnlinePage` React component.
 */
export default function page() {
  return (
    <OnlinePage />
  )
}
