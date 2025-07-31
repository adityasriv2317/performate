import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Loader2, Play, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import Link from 'next/link';

interface ActorDetail {
  name: string;
  title: string;
  description: string;
  inputSchema: any;
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
    // Fetch actor details and input schema (mocked)
    setTimeout(() => {
      setActor({
        name: actorName as string,
        title: 'Sample Actor',
        description: 'This is a sample Apify actor.',
        inputSchema: {
          properties: {
            url: { type: 'string', title: 'Target URL', description: 'URL to scrape' },
            maxResults: { type: 'number', title: 'Max Results', description: 'Maximum number of results' },
            headless: { type: 'boolean', title: 'Headless Mode', description: 'Run in headless mode' },
          },
          required: ['url'],
        },
      });
      setLoading(false);
    }, 800);
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
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8 relative">
      {showLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
          <span className="text-lg text-blue-600 font-semibold">
            {loading ? 'Loading actor details...' : 'Running actor...'}
          </span>
        </div>
      )}
      <header className="w-full max-w-2xl flex items-center justify-between mb-8">
        <Logo className="text-2xl" />
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
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
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : actor ? (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{actor.title}</h2>
            <p className="text-gray-600 mb-6">{actor.description}</p>
            <form className="flex flex-col gap-4" onSubmit={handleRun}>
              {Object.entries(actor.inputSchema.properties).map(([key, prop]: any) => (
                <div key={key} className="flex flex-col gap-1 text-left">
                  <label className="font-semibold text-gray-800">
                    {prop.title}
                    {actor.inputSchema.required?.includes(key) && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {prop.type === 'string' && (
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
                      placeholder={prop.description}
                      value={input[key] || ''}
                      onChange={e => handleInputChange(key, e.target.value)}
                      required={actor.inputSchema.required?.includes(key)}
                    />
                  )}
                  {prop.type === 'number' && (
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
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
                      <span className="text-gray-700">{prop.description}</span>
                    </label>
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
                disabled={runStatus === 'running'}
              >
                {runStatus === 'running' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {runStatus === 'running' ? 'Running...' : 'Run Actor'}
              </button>
              {runStatus === 'success' && (
                <div className="text-green-600 text-sm mt-2">Actor run completed! (Mock result)</div>
              )}
            </form>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
