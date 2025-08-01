import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<{
  apiKey: string | null;
  currentUser: string | null;
}>({ apiKey: null, currentUser: null });

export default function App({ Component, pageProps }: AppProps) {
  const [auth, setAuth] = useState<{
    apiKey: string | null;
    currentUser: string | null;
  }>({ apiKey: null, currentUser: null });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const apiKey = localStorage.getItem("apifyApiKey");
      const currentUser = localStorage.getItem("currentUser");
      setAuth({ apiKey, currentUser });
    }
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}
