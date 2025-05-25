"use client";
import React from "react";
import ErrorPage from "./components/ErrorPage";

/**
 * Custom error page component for handling not found routes.
 * 
 * This component renders the `ErrorPage` component when a user navigates to a route
 * that does not exist within the application.
 *
 * @returns {JSX.Element} The rendered error page component.
 */
export default function CustomErrorPage() {
  return <ErrorPage />;
}