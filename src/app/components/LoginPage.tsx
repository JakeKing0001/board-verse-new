"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import bcrypt from "bcryptjs";
import NavBar from "./NavBar";
import { usePieceContext } from "./PieceContext";
import { getUsers } from "../../../services/login";
import toast from "react-hot-toast";

/**
 * LoginPage component renders the login form and handles user authentication.
 *
 * Features:
 * - Allows users to input their email and password to log in.
 * - Supports "Remember Me" functionality to persist login state.
 * - Provides a toggle to show/hide the password input.
 * - Displays loading state and error messages during authentication.
 * - Integrates with context for localization, theme (dark mode), and user state.
 * - Uses toast notifications for success and error feedback.
 * - Redirects to the home page upon successful login.
 * - Includes links for password recovery and registration.
 * - Styled with animated backgrounds and responsive design.
 *
 * Context Dependencies:
 * - setIsLoggedIn: Function to update login state.
 * - allUsers: List of all registered users.
 * - t: Localization object for translated strings.
 * - darkMode: Boolean indicating if dark mode is enabled.
 *
 * @component
 * @returns {JSX.Element} The rendered login page component.
 */
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setIsLoggedIn, allUsers, t, darkMode } = usePieceContext();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRememberMe(localStorage.getItem("rememberMe") === "true");
    }
  }, []);

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  interface Errors {
    [key: string]: string | undefined;
    email?: string;
    password?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const style = document.getElementById("check-border-style");
    if (style) {
      document.head.removeChild(style);
    }
  }, []);

  useEffect(() => {
    const remember = localStorage.getItem("rememberMe") === "true";
    if (!remember) {
      sessionStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isLoggedIn");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const users = allUsers && allUsers.length > 0 ? allUsers : await getUsers();

      const user = users.find((user: { email: string; password: string }) => user.email === email);

      if (user) {
        const isPasswordValid = await bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
      }

      if (user) {
        console.log("Utente trovato:", user);
        const rememberMeCheckbox = document.getElementById("remember-me") as HTMLInputElement;
        if (rememberMeCheckbox?.checked) {
          localStorage.setItem("rememberMe", "true"); // Salva l'email nel localStorage se l'utente ha selezionato "Ricordami"
        } else {
          localStorage.removeItem("rememberMe"); // Altrimenti rimuovila
        }
        setIsLoggedIn(user.email); // Imposta lo stato di login a true
        if (localStorage.getItem("rememberMe") === "true") {
          localStorage.setItem("isLoggedIn", user.email);
        } else {
          sessionStorage.setItem("isLoggedIn", user.email);
        } // Salva lo stato di login nel localStorage
        toast.success(t.loginSuccess);
        setTimeout(() => { window.location.href = "/"; }, 500); // Reindirizzamento dopo successo
      } else {
        // console.error("Credenziali non valide.");
        toast.error(t.invalidCredentials);
        setErrors((prev) => ({ ...prev, email: "Email o password non valide" }));
      }

    } catch (error) {
      console.error("Errore nella registrazione:", error);
      setErrors(prev => ({ ...prev, email: "Registrazione fallita" }));
    } finally {
      setIsLoading(false);
      //console.log("Login attempt completed");
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-full shadow-md z-50 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <NavBar current={-1} />
      </div>
      <div className={`fixed inset-0 flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100'} pt-24`}>
      <div className="relative flex flex-col items-center justify-center">
        {/* Elementi di sfondo animati */}
        <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-80 h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse`}></div>
        <div className={`absolute top-1/3 right-1/3 w-80 h-80 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-700`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-80 h-80 ${darkMode ? 'bg-slate-500' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-pulse delay-1000`}></div>
        </div>

        {/* Container principale */}
        <div className={`z-10 p-12 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white/30 text-slate-900'} backdrop-blur-md rounded-2xl shadow-xl transform transition-all duration-500 w-full max-w-md`}>
        <h1 className="text-4xl font-bold mb-6 tracking-tight text-center">
          {t.loginPageTitle}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
          <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {t.email}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white/50 border-green-200 text-slate-900'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
            placeholder={t.yourEmail}
          />
          </div>

            <div className="space-y-2 relative">
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'}`}>
              {t.password}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 pr-12 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white/50 border-green-200 text-slate-900'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
              placeholder={t.yourPassword}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-14 right-4 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? (
              // Occhio aperto
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              ) : (
              // Occhio barrato
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.956 9.956 0 012.293-3.95m2.1-2.1A9.956 9.956 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.973 9.973 0 01-4.422 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364L19.07 4.93" />
              </svg>
              )}
            </button>
            </div>

          <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className={`h-4 w-4 ${darkMode ? 'text-slate-400 focus:ring-slate-500 border-slate-600' : 'text-green-600 focus:ring-green-500 border-green-300'} rounded`}
            checked={rememberMe}
            onChange={handleRememberMeChange}
            />
            <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-white' : 'text-green-700'}`}>
            {t.rememberMe}
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className={`font-medium ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-green-600 hover:text-green-700'}`}>
            {t.forgotPassword}
            </Link>
          </div>
          </div>

          <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-full text-white ${darkMode ? 'bg-slate-700 hover:bg-slate-600 focus:ring-slate-500' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500'} shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0`}
          >
          {isLoading ? (
            <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t.loading}
            </span>
          ) : (
            <span className="relative">
            {t.login}
            <span className="absolute bottom-0 left-0 w-full h-px bg-white transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
            </span>
          )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${darkMode ? 'text-white' : 'text-green-700'}`}>
          {t.noAccount}{" "}
          <Link href="/register" className={`font-medium ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-green-600 hover:text-green-700'}`}>
            {t.registerHere}
          </Link>
          </p>
        </div>
        </div>

        {/* Anelli decorativi */}
        <div className="absolute inset-0 -z-10">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border ${darkMode ? 'border-slate-700/30' : 'border-green-200/30'} rounded-full animate-pulse`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border ${darkMode ? 'border-slate-600/30' : 'border-amber-200/30'} rounded-full animate-pulse delay-300`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border ${darkMode ? 'border-slate-500/30' : 'border-green-300/30'} rounded-full animate-pulse delay-500`}></div>
        </div>
      </div>
      </div>
    </>
  );
};

export default LoginPage;