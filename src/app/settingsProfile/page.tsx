import React from 'react'
import SettingProfile from '../components/SettingProfile'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impostazioni profilo',
  robots: { index: false, follow: false },
}

/**
 * Renders the settings profile page.
 *
 * This component serves as the default export for the settings profile route,
 * rendering the `SettingProfile` component.
 *
 * @returns The settings profile page component.
 */
export default function page() {
  return (
    <SettingProfile />
  )
}
