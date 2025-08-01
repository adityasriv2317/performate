import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogIn,
  Rocket,
  ShieldCheck,
  ListChecks,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "../../components/Logo";
import { isAuthenticated } from "../../utils/auth";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setLoading(true);
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <svg
            className="animate-spin h-16 w-16 text-blue-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="text-lg text-blue-600 font-semibold">
            Loading...
          </span>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center flex flex-col items-center"
      >
        <Logo className="mb-6 text-4xl" />
        <p className="text-lg text-gray-600 mb-8">
          Run, manage, and visualize your Apify actors with ease.
          <br />
          <span className="text-blue-600 font-semibold">
            Professional, modern, and secure.
          </span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 w-full">
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-5 shadow-sm border border-gray-100">
            <ListChecks className="w-8 h-8 text-blue-500 mb-2" />
            <span className="font-semibold text-gray-800">
              List & Run Actors
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Browse and execute your Apify actors instantly.
            </span>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-5 shadow-sm border border-gray-100">
            <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
            <span className="font-semibold text-gray-800">
              Visualize Results
            </span>
            <span className="text-xs text-gray-500 mt-1">
              See your actor outputs in a clear, modern UI.
            </span>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-5 shadow-sm border border-gray-100">
            <ShieldCheck className="w-8 h-8 text-blue-500 mb-2" />
            <span className="font-semibold text-gray-800">
              Secure & Private
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Your API key and data are always protected.
            </span>
          </div>
        </div>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          <LogIn className="w-5 h-5" />
          Get Started
        </Link>
      </motion.div>
      <footer className="absolute bottom-2 border-t py-2 text-gray-400 text-sm w-full text-center">
        © {new Date().getFullYear()} Performate. All rights reserved.
      </footer>
    </div>
  );
}
