"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import NavBar from "./NavBar";

/**
 * ForgotPasswordPage component renders a password recovery form.
 *
 * This page allows users to enter their email address to receive a password reset link.
 * It features animated background elements, a styled form, loading state, and a confirmation message upon submission.
 *
 * Features:
 * - Animated and decorative background for enhanced user experience.
 * - Email input form with validation and loading indicator.
 * - Displays a confirmation message after the reset link is "sent".
 * - Navigation links to return to the login page.
 *
 * @component
 * @returns {JSX.Element} The rendered ForgotPasswordPage component.
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const style = document.getElementById("check-border-style");
    if (style) {
      document.head.removeChild(style);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulazione invio email di recupero - sostituire con logica reale
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <NavBar current={-1} />
      </div>
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 via-amber-50 to-green-100 pt-24">
        <div className="relative flex flex-col items-center justify-center">
          {/* Elementi di sfondo animati */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-1000"></div>
          </div>

          {/* Container principale */}
          <div className="z-10 p-12 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500 w-full max-w-md">
            {!isSubmitted ? (
              <>
                <h1 className="text-3xl font-bold text-green-800 mb-4 tracking-tight text-center">
                  Recupera Password
                </h1>
                <p className="text-green-700 mb-8 text-center">
                  Inserisci la tua email e ti invieremo un link per reimpostare la password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-green-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      placeholder="La tua email"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-full text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Invio in corso...
                      </span>
                    ) : (
                      <span className="relative">
                        Invia link di recupero
                        <span className="absolute bottom-0 left-0 w-full h-px bg-white transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                      </span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-4">Email inviata!</h2>
                <p className="text-green-700 mb-6">
                  Abbiamo inviato un link per reimpostare la password a {email}. Controlla la tua casella di posta.
                </p>
                <Link href="/login">
                  <button className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors">
                    Torna al login
                  </button>
                </Link>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-green-700">
                <Link href="/login" className="font-medium text-green-600 hover:text-green-700">
                  ← Torna al login
                </Link>
              </p>
            </div>
          </div>
          
          {/* Anelli decorativi */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-green-200/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-amber-200/30 rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-green-300/30 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;