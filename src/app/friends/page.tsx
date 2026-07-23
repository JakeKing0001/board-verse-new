import React from 'react'
import Friends from '../components/Friends'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Amici',
  description: 'Gestisci amici, richieste e conversazioni su BoardVerse.',
}

/**
 * Renders the Friends page component.
 *
 * @returns The Friends React component.
 */
export default function page() {
  return (
    <Friends />
  )
}
