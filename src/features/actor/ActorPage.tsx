import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Loader2,
  Play,
  ArrowLeft,
  Info,
  FileText,
  Terminal,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../../components/Logo";
import Link from "next/link";
import axios from "axios";
import { head } from "framer-motion/client";

const handleDownload = (
  data: any,
  format: "json" | "txt",
  actorName: string = "output"
) => {
  let content = "";
  let mime = "";
  let filename = `${actorName}-result.${format}`;
  if (format === "json") {
    content = JSON.stringify(data, null, 2);
    mime = "application/json";
  } else {
    content = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    mime = "text/plain";
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

interface ActorDetail {
  id: string;
  userId: string;
  name: string;
  username: string;
  description: string;
  pictureUrl?: string;
  inputSchema?: any;
}

interface ActorPageProps {
  actorName?: string | string[];
  username?: string | string[];
}

export default function ActorPage({ actorName, username }: ActorPageProps) {
  const [actor, setActor] = useState<ActorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState<any>({});
  const [runStatus, setRunStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!actorName || !username) return;
    setLoading(true);
    setError("");

    const url = `/api/actorDetails?name=${encodeURIComponent(
      typeof actorName === "string" ? actorName : actorName?.[0] || ""
    )}&username=${encodeURIComponent(
      typeof username === "string" ? username : username?.[0] || ""
    )}`;

    axios
      .get(url, {
        headers: {
          "x-apify-api-key": localStorage.getItem("apifyApiKey") || "",
        },
      })
      .then((response) => {
        setActor(response.data);
        if (response.data.inputSchema && response.data.inputSchema.properties) {
          setInput(
            Object.fromEntries(
              Object.entries(response.data.inputSchema.properties).map(
                ([key, prop]: any) => [key, prop.default || ""]
              )
            )
          );
        } else {
          setInput({});
        }
      })
      .catch((err) => {
        let msg = "Failed to fetch actor details";
        if (axios.isAxiosError(err)) {
          msg = err.response?.data?.error || msg;
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [actorName, username]);

  const handleInputChange = (key: string, value: any) => {
    setInput((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    setRunStatus("running");
    // Simulate actor run
    setTimeout(() => {
      setRunStatus("success");
    }, 1500);
  };

  const showLoading = loading || runStatus === "running";
  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center px-1 sm:px-4 py-4 sm:py-8 relative">
      {showLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
          <span className="text-lg text-blue-600 font-semibold">
            {loading ? "Loading actor details..." : "Running actor..."}
          </span>
        </div>
      )}
      <header className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-2 sm:gap-0 px-1 sm:px-0">
        <Logo className="text-2xl" />
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </header>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3/5"
      >
        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : actor ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 sm:p-8 shadow-sm">
            {/* Actor image and name section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-6 mb-6">
              {actor.pictureUrl ? (
                <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow w-16 h-16 sm:w-24 sm:h-24 overflow-hidden border-2 border-blue-200">
                  <img
                    src={actor.pictureUrl}
                    alt={actor.name}
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 bg-blue-100 rounded-full">
                  <Info className="w-12 h-12 text-blue-400" />
                </div>
              )}
              <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {actor.name}
                </h2>
                <div className="text-base text-blue-700 font-mono mt-1">
                  by {actor.username}
                </div>
              </div>
            </div>
            {/* Description and form below */}
            <div className="text-gray-600 text-center sm:text-left mb-6 max-w-2xl mx-auto">
              {actor.description}
            </div>
            {actor.inputSchema && actor.inputSchema.properties ? (
              <form
                className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-4"
                onSubmit={handleRun}
              >
                {Object.entries(actor.inputSchema.properties).map(
                  ([key, prop]: any) => (
                    <div key={key} className="flex flex-col gap-1 text-left">
                      <label className="font-semibold text-gray-800 text-sm sm:text-base">
                        {prop.title}
                        {actor.inputSchema.required?.includes(key) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {prop.type === "string" && (
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 text-sm sm:text-base"
                          placeholder={prop.description}
                          value={input[key] || ""}
                          onChange={(e) =>
                            handleInputChange(key, e.target.value)
                          }
                          required={actor.inputSchema.required?.includes(key)}
                        />
                      )}
                      {prop.type === "number" && (
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 text-sm sm:text-base"
                          placeholder={prop.description}
                          value={input[key] || ""}
                          onChange={(e) =>
                            handleInputChange(key, Number(e.target.value))
                          }
                          required={actor.inputSchema.required?.includes(key)}
                        />
                      )}
                      {prop.type === "boolean" && (
                        <label className="inline-flex items-center gap-2 mt-1">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            checked={!!input[key]}
                            onChange={(e) =>
                              handleInputChange(key, e.target.checked)
                            }
                          />
                          <span className="text-gray-700 text-xs sm:text-sm">
                            {prop.description}
                          </span>
                        </label>
                      )}
                    </div>
                  )
                )}
                <button
                  type="submit"
                  className="mt-3 sm:mt-4 bg-blue-600 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 font-semibold shadow hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                  disabled={runStatus === "running"}
                >
                  {runStatus === "running" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {runStatus === "running" ? "Running..." : "Run Actor"}
                </button>
                {runStatus === "success" && (
                  <div className="text-green-600 text-sm mt-2">
                    Actor run completed! (Mock result)
                  </div>
                )}
              </form>
            ) : (
              <div className="text-gray-500 italic mt-4">
                No input schema available for this actor.
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
