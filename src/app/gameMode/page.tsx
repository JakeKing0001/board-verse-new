import React from 'react'
import ChoosePage from '../components/ChoosePage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scegli modalità',
  description: 'Scegli tra partita locale, computer, online e challenge.',
}

/**
 * Renders the game mode selection page.
 * This page displays the <ChoosePage /> component, allowing users to select a game mode.
 *
 * @returns {JSX.Element} The rendered game mode selection page.
 */
export default function page() {
    return (
        <>
            <ChoosePage />
        </>
    )
}
