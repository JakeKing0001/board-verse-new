"use client";

import React from 'react'
import ChooseTime from '../components/ChooseTime'

/**
 * Renders the page component for choosing a time.
 * This component serves as the entry point for the "choose time" page,
 * rendering the {@link ChooseTime} component.
 *
 * @returns {JSX.Element} The rendered ChooseTime page component.
 */
export default function page() {
    return (
        <>
            <ChooseTime />
        </>
    )
}
