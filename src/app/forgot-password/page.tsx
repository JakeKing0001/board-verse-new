import React from 'react'
import ForgotPasswordPage from '../components/ForgotPasswordPage'

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
