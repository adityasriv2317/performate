
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Loader2, Play, ArrowLeft, Info, FileText, Terminal, Download } from 'lucide-react';
  // Download output as file
  const handleDownload = (data: any, format: 'json' | 'txt', actorName: string = 'output') => {
    let content = '';
    let mime = '';
    let filename = `${actorName}-result.${format}`;
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mime = 'application/json';
    } else {
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      mime = 'text/plain';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import Link from 'next/link';
import axios from 'axios';


interface ActorDetail {
  name: string;
  title: string;
  description: string;
  inputSchema: any;
  stats?: {
    runs: number;
    lastRun: string;
    status: string;
  };
  lastResult?: {
    log: string;
    output: any;
  };
}

export default function ActorPage() {
  const router = useRouter();
  const { actorName } = router.query;
  const [actor, setActor] = useState<ActorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [input, setInput] = useState<any>({});
  const [runStatus, setRunStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!actorName) return;
    setLoading(true);
    setError('');
    axios
      .get(`/api/actorDetails?name=${encodeURIComponent(actorName as string)}`)
      .then((res) => {
        setActor(res.data);
      })
      .catch((err) => {
        let msg = 'Failed to fetch actor details';
        if (axios.isAxiosError(err)) {
          msg = err.response?.data?.error || msg;
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [actorName]);

  const handleInputChange = (key: string, value: any) => {
    setInput((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    setRunStatus('running');
    // Simulate actor run
    setTimeout(() => {
      setRunStatus('success');
    }, 1500);
  };

  const showLoading = loading || runStatus === 'running';
  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center px-1 sm:px-4 py-4 sm:py-8 relative">
      {showLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
          <span className="text-lg text-blue-600 font-semibold">
            {loading ? 'Loading actor details...' : 'Running actor...'}
          </span>
        </div>
      )}
      <header className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-2 sm:gap-0 px-1 sm:px-0">
        <Logo className="text-2xl" />
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Info className="w-6 h-6 text-blue-500" /> {actor.title}
                </h2>
                <div className="text-sm text-blue-700 font-mono mb-1">{actor.name}</div>
                <p className="text-gray-600 mb-2">{actor.description}</p>
              </div>
              {actor.stats && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-900 flex flex-col gap-1 min-w-[120px]">
                  <div><span className="font-semibold">Runs:</span> {actor.stats.runs}</div>
                  <div><span className="font-semibold">Last Run:</span> {new Date(actor.stats.lastRun).toLocaleString()}</div>
                  <div><span className="font-semibold">Status:</span> {actor.stats.status}</div>
                </div>
              )}
            </div>
            <form className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-4" onSubmit={handleRun}>
              {Object.entries(actor.inputSchema.properties).map(([key, prop]: any) => (
                <div key={key} className="flex flex-col gap-1 text-left">
                  <label className="font-semibold text-gray-800 text-sm sm:text-base">
                    {prop.title}
                    {actor.inputSchema.required?.includes(key) && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {prop.type === 'string' && (
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 text-sm sm:text-base"
                      placeholder={prop.description}
                      value={input[key] || ''}
                      onChange={e => handleInputChange(key, e.target.value)}
                      required={actor.inputSchema.required?.includes(key)}
                    />
                  )}
                  {prop.type === 'number' && (
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 text-sm sm:text-base"
                      placeholder={prop.description}
                      value={input[key] || ''}
                      onChange={e => handleInputChange(key, Number(e.target.value))}
                      required={actor.inputSchema.required?.includes(key)}
                    />
                  )}
                  {prop.type === 'boolean' && (
                    <label className="inline-flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={!!input[key]}
                        onChange={e => handleInputChange(key, e.target.checked)}
                      />
                      <span className="text-gray-700 text-xs sm:text-sm">{prop.description}</span>
                    </label>
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="mt-3 sm:mt-4 bg-blue-600 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 font-semibold shadow hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                disabled={runStatus === 'running'}
              >
                {runStatus === 'running' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {runStatus === 'running' ? 'Running...' : 'Run Actor'}
              </button>
              {runStatus === 'success' && (
                <div className="text-green-600 text-sm mt-2">Actor run completed! (Mock result)</div>
              )}
            </form>
            {actor && actor.lastResult && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-2 text-blue-900 font-semibold text-base">
                  <Terminal className="w-5 h-5 text-blue-500" /> Logs / Result
                </div>
                <div className="bg-gray-900 text-green-200 font-mono text-xs rounded-lg p-4 overflow-x-auto overflow-y-auto whitespace-pre max-h-[400px] mb-2">
                  {actor.lastResult.log}
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-900 flex flex-col gap-2">
                  <div className="overflow-x-auto overflow-y-auto whitespace-pre max-h-[400px]">
                    <span className="font-semibold">Output:</span> {typeof actor.lastResult.output === 'string' ? actor.lastResult.output : JSON.stringify(actor.lastResult.output, null, 2)}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-semibold"
                      onClick={() => handleDownload(actor.lastResult!.output, 'json', actor.name)}
                    >
                      <Download className="w-4 h-4" /> Download JSON
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-semibold"
                      onClick={() => handleDownload(actor.lastResult!.output, 'txt', actor.name)}
                    >
                      <Download className="w-4 h-4" /> Download TXT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
