import React from 'react'
import MyProfile from '../components/MyProfile'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profilo',
  robots: { index: false, follow: false },
}

/**
 * Renders the user's profile page.
 *
 * This is the default export for the profile page route.
 * It displays the <MyProfile /> component, which contains
 * the user's profile information and related functionality.
 *
 * @returns {JSX.Element} The rendered profile page component.
 */
export default function page() {
  return (
    <MyProfile />
  )
}
