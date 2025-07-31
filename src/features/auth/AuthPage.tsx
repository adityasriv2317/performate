import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, UserPlus, LogIn, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    if (mode === "register" && !apiKey.trim()) {
      setError("API key is required for registration");
      return;
    }
    setLoading(true);
    if (mode === 'register') {
      fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, apiKey })
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Registration failed');
          localStorage.setItem('apifyApiKey', apiKey);
          localStorage.setItem('currentUser', username);
          setError('');
          setLoading(false);
          window.location.href = '/dashboard';
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Login failed');
          localStorage.setItem('apifyApiKey', data.apiKey);
          localStorage.setItem('currentUser', username);
          setError('');
          setLoading(false);
          window.location.href = '/dashboard';
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center px-2 py-6 sm:py-12 relative">
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
            {mode === "register" ? "Registering..." : "Authenticating..."}
          </span>
        </div>
      )}
      <div className="w-full max-w-md mx-auto">
        <Link href="/" className="flex justify-center items-center gap-2 w-fit p-2 border hover:border-blue-400 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-100 font-semibold mb-6 transition text-sm">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="bg-white/90 shadow-xl rounded-2xl p-6 sm:p-10 flex flex-col gap-6 border border-gray-100"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-3 mb-1">
              {mode === "register" ? (
                <UserPlus className="w-8 h-8 text-blue-600" />
              ) : (
                <LogIn className="w-8 h-8 text-blue-600" />
              )}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "register" ? "Register" : "Login"}
            </h2>
            <p className="text-gray-500 text-sm">
              {mode === "register"
                ? "Create an account and link your Apify API key."
                : "Login to your account."}
            </p>
          </div>
          <input
            type="text"
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 w-full pr-12"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {mode === "register" && (
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
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold shadow hover:bg-blue-700 transition"
            disabled={loading}
          >
            {mode === "register" ? "Register" : "Login"}
          </button>
          <div className="text-center text-sm text-gray-500 mt-2">
            {mode === "register" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-semibold"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-semibold"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </motion.form>
      </div>
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
