import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function AuthPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("apifyApiKey", apiKey);
      setError("");
      setLoading(false);
      // Redirect or update auth state (to be implemented)
      window.location.href = "/dashboard";
    }, 1200);
  };

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
            Authenticating...
          </span>
        </div>
      )}
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2">
          <KeyRound className="w-10 h-10 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Authenticate with Apify
          </h2>
          <p className="text-gray-500 text-sm">
            Enter your Apify API key to continue
          </p>
        </div>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 w-full pr-12"
            placeholder="Apify API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none"
            tabIndex={-1}
            onClick={() => setShowApiKey((v) => !v)}
            aria-label={showApiKey ? "Hide API key" : "Show API key"}
          >
            {showApiKey ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold shadow hover:bg-blue-700 transition"
          disabled={loading}
        >
          Continue
        </button>
      </motion.form>
    </div>
  );
}

// export default function AuthPage() {
//   const [apiKey, setApiKey] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!apiKey.trim()) {
//       setError('API key is required');
//       return;
//     }
//     setLoading(true);
//     setTimeout(() => {
//       localStorage.setItem('apifyApiKey', apiKey);
//       setError('');
//       setLoading(false);
//       // Redirect or update auth state (to be implemented)
//       window.location.href = '/dashboard';
//     }, 1200);
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative">
//       {loading && (
//         <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
//           <svg className="animate-spin h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
//           </svg>
//           <span className="text-lg text-blue-600 font-semibold">Authenticating...</span>
//         </div>
//       )}
//       <motion.form
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         onSubmit={handleSubmit}
//         className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full flex flex-col gap-6"
//       >
//         <div className="flex flex-col items-center gap-2">
//           <KeyRound className="w-10 h-10 text-blue-600" />
//           <h2 className="text-2xl font-bold text-gray-900">Authenticate with Apify</h2>
//           <p className="text-gray-500 text-sm">Enter your Apify API key to continue</p>
//         </div>
//         <input
//           type="password"
//           className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
//           placeholder="Apify API Key"
//           value={apiKey}
//           onChange={e => setApiKey(e.target.value)}
//         />
//         {error && <div className="text-red-500 text-sm">{error}</div>}
//         <button
//           type="submit"
//           className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold shadow hover:bg-blue-700 transition"
//           disabled={loading}
//         >
//           Continue
//         </button>
//       </motion.form>
//     </div>
//   );
// }
