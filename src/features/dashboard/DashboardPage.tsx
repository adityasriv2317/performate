import { useEffect, useState } from "react";
import { ListChecks, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../../components/Logo";
import Link from "next/link";
import { useRouter } from "next/router";
import ProfileMenu from "../../components/ProfileMenu";
import axios from "axios";

interface Actor {
  id: string;
  name: string;
  username: string;
  title: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const apiKey = localStorage.getItem("apifyApiKey");
    if (!apiKey) {
      setError("API key not found. Please authenticate.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await axios.get("/api/actors", {
          headers: { "x-apify-api-key": apiKey },
        });
        setActors(res.data.actors || []);
      } catch (err) {
        let msg = "Failed to fetch actors";
        if (axios.isAxiosError(err)) {
          msg = err.response?.data?.error || msg;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center px-1 sm:px-4 py-4 sm:py-8 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
          <span className="text-lg text-blue-600 font-semibold">
            Loading actors...
          </span>
        </div>
      )}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-10 bg-white/50 border-b border-gray-200 rounded-2xl shadow-sm px-3 sm:px-6 py-3 sm:py-4 gap-2 sm:gap-0">
        <Logo className="text-2xl" />
        <ProfileMenu />
      </header>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8 gap-2 sm:gap-4 px-1 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ListChecks className="w-7 h-7 text-blue-600" /> Your Apify Actors
          </h2>
        </div>
        <div className="rounded-2xl bg-white/60 border border-gray-200 shadow-lg p-3 sm:p-6">
          {error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : actors.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No actors found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {actors.map((actor) => (
                <button
                  key={actor.id}
                  onClick={() =>
                    router.push(`/actor/${actor.name}/${actor.username}`)
                  }
                  className="bg-blue-50 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group min-h-[140px] flex flex-col justify-between text-left w-full"
                  type="button"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {actor.title}
                  </h3>
                  <span className="text-xs text-blue-600 font-mono bg-blue-50 rounded px-2 py-1">
                    <span className="text-gray-700 font-semibold">Actor:</span>{" "}
                    {actor.name}
                  </span>
                  <span className="text-xs text-blue-600 font-mono bg-blue-50 rounded px-2 py-1">
                    <span className="text-gray-700 font-semibold">
                      Username:
                    </span>{" "}
                    {actor.username}
                  </span>
                  <span className="text-xs text-gray-500 font-mono bg-blue-100 rounded px-2 py-1">
                    {actor.createdAt}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
