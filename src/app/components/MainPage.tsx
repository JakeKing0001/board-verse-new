import Link from "next/link";
import NavBar from "./NavBar";
import { useEffect } from "react";

const MainPage = () => {

  useEffect(() => {
    const style = document.getElementById("check-border-style");
    console.log(style);
    if (style) {
      document.head.removeChild(style);
    }
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <NavBar current={0} />
      </div>
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 via-amber-50 to-green-100 pt-24">
        <div className="relative flex flex-col items-center justify-center">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-1000"></div>
          </div>

          {/* Main content container */}
          <div className="z-10 text-center p-16 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500">
            <h1 className="text-6xl font-bold text-green-800 mb-8 tracking-tight">
              Boardverse
            </h1>
            <p className="text-2xl text-green-700 mb-10 font-light">
              Dove le Strategie si Incontrano
            </p>

            <Link href="/gameMode">
              <button className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-semibold text-white transition-all duration-500 ease-in-out transform bg-gradient-to-r from-green-500 to-green-600 rounded-full hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0">
                <span className="relative">
                  Inizia a Giocare
                  <span className="absolute bottom-0 left-0 w-full h-px bg-white transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </span>
              </button>
            </Link>

            {/* Decorative rings */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-green-200/30 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-amber-200/30 rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-green-300/30 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;