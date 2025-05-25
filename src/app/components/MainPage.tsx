import Link from "next/link";
import NavBar from "./NavBar";
import { useEffect } from "react";
import { usePieceContext } from "./PieceContext";
import toast from "react-hot-toast";

const MainPage = () => {
  const { isLoggedIn, t, darkMode } = usePieceContext();

  useEffect(() => {
    const style = document.getElementById("check-border-style");
    if (style) {
      document.head.removeChild(style);
    }
  }, []);

  return (
    <>
      <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
        <NavBar current={0} />
      </div>
      <div className={`fixed inset-0 flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100'} pt-24 overflow-hidden`}>
        <div className="relative flex flex-col items-center justify-center">
          {/* Animated background elements - migliorati con più elementi e colori */}
          <div className="absolute inset-0">
            <div className={`absolute top-1/4 left-1/4 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
            <div className={`absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700`}></div>
            <div className={`absolute bottom-1/4 left-1/3 w-36 h-36 sm:w-56 sm:h-56 md:w-72 md:h-72 ${darkMode ? 'bg-slate-800' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000`}></div>
            <div className={`absolute bottom-1/3 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 ${darkMode ? 'bg-slate-700' : 'bg-amber-100'} rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500`}></div>
          </div>

          {/* Main content container - design migliorato */}
          <div className={`z-10 text-center px-4 py-8 sm:px-8 sm:py-10 md:p-14 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white/40 text-green-800'} backdrop-blur-md rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 border ${darkMode ? 'border-slate-700' : 'border-white/50'} w-[95vw] max-w-xl sm:max-w-2xl`}>
            <h1 className="text-6xl font-bold mb-6 tracking-tight">
              Boardverse
            </h1>
            <p className="text-2xl mb-10 font-light max-w-md mx-auto">
              {t.mainPageDescription}
            </p>

            <Link href={isLoggedIn ? "/gameMode" : ""}>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    toast.error("Devi essere loggato per iniziare a giocare!");
                  }
                }}
                className={`group relative inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-white transition-all duration-500 ease-in-out transform ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0`}
              >
                <span className="relative flex items-center">
                  <span>{t.play}</span>
                  <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                  <span className="absolute bottom-0 left-0 w-full h-px bg-white transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </span>
              </button>
            </Link>

            {/* Decorative rings - design migliorato */}
            <div className="absolute inset-0 -z-10">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] border-2 ${darkMode ? 'border-slate-700/30' : 'border-green-200/30'} rounded-full animate-pulse`}></div>
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border-2 ${darkMode ? 'border-slate-600/30' : 'border-amber-200/30'} rounded-full animate-pulse delay-300`}></div>
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border-2 ${darkMode ? 'border-slate-500/30' : 'border-green-300/30'} rounded-full animate-pulse delay-500`}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;