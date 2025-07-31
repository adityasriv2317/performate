import { useEffect, useState } from "react";
import { ListChecks, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../../components/Logo";
import Link from "next/link";
import ProfileMenu from "../../components/ProfileMenu";

interface Actor {
  id: string;
  name: string;
  title: string;
  description: string;
}

export default function DashboardPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Profile state moved to ProfileMenu

  useEffect(() => {
    // Get username from localStorage
    const apiKey = localStorage.getItem("apifyApiKey");
    if (!apiKey) {
      setError("API key not found. Please authenticate.");
      setLoading(false);
      return;
    }
    // Fetch actors from Apify API (mocked for now)
    setTimeout(() => {
      setActors([
        {
          id: "1",
          name: "example-actor",
          title: "Example Actor",
          description: "A sample Apify actor.",
        },
        {
          id: "2",
          name: "scraper",
          title: "Web Scraper",
          description: "Scrapes web data efficiently.",
        },
      ]);
      setLoading(false);
    }, 1000);

    // ProfileMenu handles its own dropdown logic
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
          <span className="text-lg text-blue-600 font-semibold">
            Loading actors...
          </span>
        </div>
      )}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <Logo className="text-2xl" />
        <ProfileMenu />
      </header>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ListChecks className="w-7 h-7 text-blue-600" /> Your Apify Actors
        </h2>
        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : actors.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No actors found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actors.map((actor) => (
              <Link
                key={actor.id}
                href={`/actor/${actor.name}`}
                className="block bg-gray-50 border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {actor.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {actor.description}
                </p>
                <span className="text-xs text-blue-600 font-mono">
                  {actor.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
