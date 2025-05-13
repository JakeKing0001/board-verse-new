import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    HomeIcon,
    UserGroupIcon,
    PuzzlePieceIcon,
    InformationCircleIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { BarChartIcon } from "lucide-react";
import { usePieceContext } from "./PieceContext";

export default function SideBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, t, darkMode } = usePieceContext();

    const menuItems = [
        { name: `${t.home}`, icon: HomeIcon, href: "/" },
        { name: `${t.gameTypes}`, icon: PuzzlePieceIcon, href: "/games" },
        { name: `${t.friends}`, icon: UserGroupIcon, href: "/friends" },
        { name: `${t.about}`, icon: InformationCircleIcon, href: "/about" },
        { name: `${t.statistics}`, icon: BarChartIcon, href: "/statistics" },
    ];

    return (
        <>
            <button
                id="SidebarButton"
                onClick={(e) => {
                    setIsOpen(!isOpen);
                    (e.currentTarget as HTMLButtonElement).style.display = "none";
                }}
                className={`fixed top-4 left-4 z-50 inline-flex items-center p-2 text-sm ${darkMode? 'text-white bg-slate-600 hover:bg-slate-500 focus:ring-slate-300':'text-green-600 bg-white hover:bg-green-50 focus:ring-green-300'} rounded-lg shadow-md focus:outline-none focus:ring-2`}
            >
                <span className="sr-only">Toggle sidebar</span>
                <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    fill={darkMode? 'white':'green'}
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                    ></path>
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                w-64`}
                aria-label="Sidebar"
            >
                <div className="h-full flex flex-col justify-between">
                    {/* Logo and Menu Items */}
                    <div className="px-3 py-4 overflow-y-auto">
                        <div className="flex items-center justify-center mb-6">
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>{t.gameTypes}</h2>
                        </div>

                        <ul className="space-y-5 font-medium">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        className={`flex items-center p-3 rounded-lg group transition-all duration-200 ${
                                            darkMode
                                                ? 'text-white hover:bg-slate-600'
                                                : 'text-gray-900 hover:bg-green-100'
                                        }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-green-600'}`} />
                                        <span className="ms-3">{item.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* User Profile and Settings */}
                    <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-4">
                        <Link href="/settingsProfile">
                            <button
                                className={`w-full flex items-center p-3 rounded-lg group transition-all duration-200 mb-3 no-underline ${
                                    darkMode
                                        ? 'text-white bg-slate-900 hover:bg-slate-600'
                                        : 'text-gray-900 bg-green-100 hover:bg-green-50'
                                }`}
                            >
                                <Cog6ToothIcon className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-green-600'}`} />
                                <span className="ms-3 no-underline font-medium">
                                    {t.profileSettings}
                                </span>
                            </button>
                        </Link>

                        {/* User Profile */}
                        {user && (
                            <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'text-white bg-slate-900' : 'text-gray-900 bg-green-50'}`}>
                                <img
                                    src={user.avatar || "/default_avatar.png"}
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-lg"
                                />
                                <div className="ms-3">
                                    <p />
                                    <p className="text-sm font-medium">{user.username}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
                    onClick={() => {
                        setIsOpen(false);
                        const button = document.getElementById("SidebarButton");
                        if (button) {
                            button.style.display = "inline-flex";
                        }
                    }}
                ></div>
            )}
        </>
    );
}