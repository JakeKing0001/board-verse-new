"use client";

import React from 'react'
import ChooseTime from '../components/ChooseTime'
import SideBar from '../components/SideBar';
import { PieceProvider } from '../components/PieceContext';

export default function page() {
    return (
        <>
            <div className='fixed bg-transparent'>
                <SideBar />
            </div>
            <ChooseTime />
        </>
    )
}
