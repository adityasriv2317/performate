import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  Play,
  ArrowLeft,
  Info,
  FileText,
  Terminal,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRef as useDialogRef } from "react";
import Logo from "../../components/Logo";
import Link from "next/link";
import axios from "axios";
import { head } from "framer-motion/client";
import { isAuthenticated } from "../../utils/auth";

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
  const [expandedFields, setExpandedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [overflowingFields, setOverflowingFields] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth");
      return;
    }

    if (!actorName || !username) return;
    setLoading(true);
    setError("");

    const url = `/api/actorDetails?name=${encodeURIComponent(
      typeof actorName === "string" ? actorName : actorName?.[0] || ""
    )}&username=${encodeURIComponent(
      typeof username === "string" ? username : username?.[0] || ""
    )}`;

    const apiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("apifyApiKey") || ""
        : "";
    axios
      .get(url, {
        headers: {
          "x-apify-api-key": apiKey,
        },
      })
      .then((response) => {
        setActor(response.data);
        if (response.data.inputSchema && response.data.inputSchema.properties) {
          const initialInput: any = {};
          Object.entries(response.data.inputSchema.properties).forEach(
            ([key, prop]: any) => {
              if (prop.type === "boolean") {
                if (prop.default !== undefined) {
                  initialInput[key] = prop.default;
                } else if (prop.prefill !== undefined) {
                  initialInput[key] = prop.prefill;
                } else {
                  initialInput[key] = false;
                }
              } else if (prop.default !== undefined) {
                initialInput[key] = prop.default;
              } else if (prop.prefill !== undefined) {
                initialInput[key] = prop.prefill;
              } else if (prop.type === "array") {
                initialInput[key] = [];
              } else {
                initialInput[key] = "";
              }
            }
          );
          setInput(initialInput);
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
  }, [actorName, username, router]);

  const handleInputChange = (key: string, value: any) => {
    setInput((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleExpand = (key: string) => {
    setExpandedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Utility to check if a description overflows 3 lines
  const descRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  useEffect(() => {
    if (!actor?.inputSchema?.properties) return;
    const newOverflow: { [key: string]: boolean } = {};
    Object.entries(actor.inputSchema.properties).forEach(([key, prop]: any) => {
      if (descRefs.current[key]) {
        const el = descRefs.current[key]!;
        if (!expandedFields[key]) {
          // Only measure overflow when collapsed
          el.classList.remove("line-clamp-3", "overflow-hidden");
          const isOverflowing = el.scrollHeight > el.clientHeight + 2;
          el.classList.add("line-clamp-3", "overflow-hidden");
          newOverflow[key] = isOverflowing;
        } else {
          // When expanded, always show the collapse button if it was overflowing when collapsed
          newOverflow[key] = true;
        }
      }
    });
    setOverflowingFields(newOverflow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, expandedFields]);

  // Util: Run actor via Apify API
  async function runActorAsync(
    actorId: string,
    inputObj: object,
    apiKey: string,
    build?: string
  ) {
    try {
      const headers = { Authorization: `Bearer ${apiKey}` };
      const params: { [key: string]: string } = {};
      if (build) params.build = build;
      const response = await axios.post(
        `https://api.apify.com/v2/acts/${actorId}/runs`,
        inputObj,
        { headers, params }
      );
      const run = response.data.data;
      return run;
    } catch (error: any) {
      throw error;
    }
  }

  // Enhanced handleRun: start real actor run
  const [runInfo, setRunInfo] = useState<any>(null);
  const [runError, setRunError] = useState<string>("");
  const [showRunDialog, setShowRunDialog] = useState(false);
  const dialogRef = useDialogRef<HTMLDivElement>(null);
  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunStatus("running");
    setRunError("");
    setRunInfo(null);
    try {
      if (!actor) throw new Error("No actor loaded");
      const apiKey =
        typeof window !== "undefined"
          ? localStorage.getItem("apifyApiKey") || ""
          : "";
      if (!apiKey) throw new Error("No Apify API key found");
      // actor.id is like 'apify~instagram-scraper'
      const run = await runActorAsync(actor.id, input, apiKey);
      setRunInfo(run);
      setRunStatus("success");
      setShowRunDialog(true);
    } catch (err: any) {
      setRunStatus("error");
      setRunError(
        err.response?.data?.message ||
          err.message ||
          "Failed to start actor run"
      );
    }
  };

  const showLoading = loading || runStatus === "running";
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center px-2 sm:px-6 py-6 sm:py-12 relative">
      {showLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
          <span className="text-lg text-blue-600 font-semibold">
            {loading ? "Loading actor details..." : "Running actor..."}
          </span>
        </div>
      )}
      <header className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-12 gap-2 sm:gap-0 px-1 sm:px-0">
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
        className="w-full max-w-2xl"
      >
        {error ? (
          <div className="text-red-500 text-center py-8 font-semibold text-lg bg-white/80 rounded-lg shadow-md border border-red-200">
            {error}
          </div>
        ) : actor ? (
          <div className="bg-white/90 border border-gray-200 rounded-2xl p-4 sm:p-10 shadow-xl">
            {/* Actor image and name section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-8 mb-8">
              {actor.pictureUrl ? (
                <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-lg w-20 h-20 sm:w-28 sm:h-28 overflow-hidden border-4 border-blue-200">
                  <img
                    src={actor.pictureUrl}
                    alt={actor.name}
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 bg-blue-100 rounded-full border-2 border-blue-200">
                  <Info className="w-12 h-12 text-blue-400" />
                </div>
              )}
              <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-start">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-2">
                  {actor.name}
                </h2>
                <div className="text-base text-blue-700 font-mono mt-1">
                  by {actor.username}
                </div>
              </div>
            </div>
            {/* Description and form below */}
            <div className="text-gray-700 text-center sm:text-left mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              {actor.description}
            </div>
            <div className="border-b border-gray-200 mb-8" />
            <div className="mb-6">
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                Configure Actor Input
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Fill out the fields below to run the actor with your desired
                settings.
              </p>
            </div>
            {actor.inputSchema && actor.inputSchema.properties ? (
              <form
                className="flex flex-col gap-5 sm:gap-6"
                onSubmit={handleRun}
              >
                {Object.entries(actor.inputSchema.properties).map(
                  ([key, prop]: any) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 text-left bg-blue-50/60 border border-blue-100 rounded-xl p-4 shadow-sm"
                    >
                      <label className="font-semibold text-gray-800 text-base sm:text-lg mb-1">
                        {prop.title || key}
                        {actor.inputSchema.required?.includes(key) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {prop.description ? (
                        <div className="relative mb-2 group">
                          <div
                            ref={(el) => {
                              descRefs.current[key] = el;
                            }}
                            className={`text-xs text-gray-600 whitespace-pre-line pr-8 ${
                              expandedFields[key]
                                ? ""
                                : "line-clamp-3 overflow-hidden"
                            }`}
                            style={{
                              maxHeight: expandedFields[key] ? "none" : "4.5em",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: prop.description,
                            }}
                          />
                          {overflowingFields[key] && (
                            <button
                              type="button"
                              aria-label={
                                expandedFields[key] ? "Collapse" : "Expand"
                              }
                              className="absolute right-1 top-1 bg-white/90 rounded-full p-1 shadow border border-gray-200 flex items-center justify-center transition hover:bg-blue-100 text-blue-600 focus:outline-none"
                              style={{ visibility: "visible", opacity: 1 }}
                              onClick={() => toggleExpand(key)}
                            >
                              {expandedFields[key] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      ) : null}
                      {/* Input fields always rendered below, regardless of description */}
                      {/* Array of objects (container fields) */}
                      {prop.type === "array" &&
                        prop.items &&
                        prop.items.type === "object" && (
                          <div className="space-y-4">
                            {(input[key] || []).map(
                              (item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="border border-gray-300 rounded-lg p-3 bg-white flex flex-col gap-2 relative"
                                >
                                  {Object.entries(
                                    prop.items.properties || {}
                                  ).map(([subKey, subProp]: any) => (
                                    <div
                                      key={subKey}
                                      className="flex flex-col gap-1"
                                    >
                                      <label className="text-xs font-semibold text-gray-700">
                                        {subProp.title || subKey}
                                      </label>
                                      <input
                                        type="text"
                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                        placeholder={
                                          subProp.description || subProp.title
                                        }
                                        value={item[subKey] || ""}
                                        onChange={(e) => {
                                          const newArr = [
                                            ...(input[key] || []),
                                          ];
                                          newArr[idx] = {
                                            ...newArr[idx],
                                            [subKey]: e.target.value,
                                          };
                                          handleInputChange(key, newArr);
                                        }}
                                      />
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newArr = (input[key] || []).filter(
                                        (_: any, i: number) => i !== idx
                                      );
                                      handleInputChange(key, newArr);
                                    }}
                                    className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newArr = [...(input[key] || []), {}];
                                handleInputChange(key, newArr);
                              }}
                              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                            >
                              Add {prop.title || "Item"}
                            </button>
                          </div>
                        )}
                      {/* String List (Array) Input (default if no editor specified, or array of strings) */}
                      {prop.type === "array" &&
                        (!prop.items ||
                          prop.items.type === "string" ||
                          !prop.items.type) &&
                        (!prop.editor || prop.editor === "stringList") && (
                          <div className="space-y-2">
                            {(input[key] || []).map(
                              (item: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                  <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white text-sm"
                                    placeholder={
                                      prop.placeholderValue || prop.title
                                    }
                                    value={item}
                                    onChange={(e) => {
                                      const newArray = [...(input[key] || [])];
                                      newArray[index] = e.target.value;
                                      handleInputChange(key, newArray);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newArray = (
                                        input[key] || []
                                      ).filter(
                                        (_: any, i: number) => i !== index
                                      );
                                      handleInputChange(key, newArray);
                                    }}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newArray = [...(input[key] || []), ""];
                                handleInputChange(key, newArray);
                              }}
                              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                            >
                              Add {prop.placeholderValue || "Item"}
                            </button>
                          </div>
                        )}
                      {/* Select Dropdown */}
                      {prop.type === "string" && prop.editor === "select" && (
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white text-sm"
                          value={input[key] || ""}
                          onChange={(e) =>
                            handleInputChange(key, e.target.value)
                          }
                          required={actor.inputSchema.required?.includes(key)}
                        >
                          <option value="">Select {prop.title}</option>
                          {prop.enum?.map((option: string, index: number) => (
                            <option key={option} value={option}>
                              {prop.enumTitles?.[index] || option}
                            </option>
                          ))}
                        </select>
                      )}
                      {/* Text Input */}
                      {prop.type === "string" &&
                        (!prop.editor || prop.editor === "textfield") && (
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white text-sm"
                            placeholder={prop.description || prop.title}
                            value={input[key] || ""}
                            onChange={(e) =>
                              handleInputChange(key, e.target.value)
                            }
                            required={actor.inputSchema.required?.includes(key)}
                            pattern={prop.pattern}
                          />
                        )}
                      {/* Date Picker */}
                      {prop.type === "string" &&
                        prop.editor === "datepicker" && (
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white text-sm"
                            placeholder="YYYY-MM-DD or relative (e.g., 1 day, 2 months)"
                            value={input[key] || ""}
                            onChange={(e) =>
                              handleInputChange(key, e.target.value)
                            }
                            required={actor.inputSchema.required?.includes(key)}
                            pattern={prop.pattern}
                          />
                        )}
                      {/* Number Input */}
                      {prop.type === "integer" && (
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white text-sm"
                          placeholder={prop.description || prop.title}
                          value={input[key] || ""}
                          onChange={(e) =>
                            handleInputChange(key, Number(e.target.value))
                          }
                          required={actor.inputSchema.required?.includes(key)}
                          min={prop.minimum}
                          max={prop.maximum}
                        />
                      )}
                      {/* Boolean Checkbox */}
                      {prop.type === "boolean" && (
                        <label className="inline-flex items-center gap-2 mt-1">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            checked={!!input[key]}
                            onChange={(e) =>
                              handleInputChange(key, e.target.checked)
                            }
                          />
                          <span className="text-gray-700 text-xs sm:text-sm">
                            {prop.description || prop.title}
                          </span>
                        </label>
                      )}
                      {/* Hidden fields are not rendered */}
                    </div>
                  )
                )}
                <button
                  type="submit"
                  className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl px-6 sm:px-8 py-3 sm:py-4 font-bold shadow-lg hover:from-blue-700 hover:to-blue-500 transition flex items-center justify-center gap-2 text-base sm:text-lg"
                  disabled={runStatus === "running"}
                >
                  {runStatus === "running" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {runStatus === "running" ? "Running..." : "Run Actor"}
                </button>
                {/* Run Info Dialog */}
                {showRunDialog && runInfo && (
                  <div
                    ref={dialogRef}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={(e) => {
                      if (e.target === dialogRef.current)
                        setShowRunDialog(false);
                    }}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative border border-blue-200 animate-fadeIn">
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-xl font-bold focus:outline-none"
                        onClick={() => setShowRunDialog(false)}
                        aria-label="Close dialog"
                      >
                        ×
                      </button>
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <span className="text-lg font-bold text-blue-800">
                          Actor Run Started
                        </span>
                      </div>
                      <div className="text-gray-700 text-base mb-2">
                        <span className="font-semibold">Run ID:</span>{" "}
                        <span className="font-mono break-all">
                          {runInfo.id}
                        </span>
                      </div>
                      <div className="text-gray-700 text-base mb-2">
                        <span className="font-semibold">Status:</span>{" "}
                        <span className="font-mono">{runInfo.status}</span>
                      </div>
                      <div className="text-gray-700 text-base mb-2">
                        <span className="font-semibold">
                          Default Dataset ID:
                        </span>{" "}
                        <span className="font-mono break-all">
                          {runInfo.defaultDatasetId}
                        </span>
                      </div>
                      <div className="text-gray-700 text-base mb-2">
                        <span className="font-semibold">Started At:</span>{" "}
                        <span className="font-mono">
                          {runInfo.startedAt
                            ? new Date(runInfo.startedAt).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                      <div className="text-gray-700 text-base mb-2">
                        <span className="font-semibold">Build:</span>{" "}
                        <span className="font-mono">
                          {runInfo.buildId || runInfo.build || "-"}
                        </span>
                      </div>
                      <div className="text-gray-700 text-base mb-2">
                        <span className="font-semibold">Actor ID:</span>{" "}
                        <span className="font-mono break-all">
                          {runInfo.actId || runInfo.actorId || "-"}
                        </span>
                      </div>
                      <div className="text-gray-700 text-base mb-2">
                        <span className="font-semibold">API Endpoint:</span>{" "}
                        <span className="font-mono break-all underline text-blue-500">
                          https://api.apify.com/v2/acts/
                          {runInfo.actId || runInfo.actorId || actor?.id}/runs/
                          {runInfo.id}
                        </span>
                      </div>
                      <div className="mt-4">
                        <pre className="bg-gray-950 rounded p-3 text-xs overflow-x-auto max-h-72 border border-gray-200">
                          {JSON.stringify(runInfo, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                {runStatus === "error" && runError && (
                  <div className="text-red-600 text-base mt-3 font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Failed to start actor run:{" "}
                    {runError}
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
