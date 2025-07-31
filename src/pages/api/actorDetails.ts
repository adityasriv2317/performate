import type { NextApiRequest, NextApiResponse } from 'next';

// This is a mock endpoint. Replace with real Apify API integration as needed.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid actor name' });
  }

  res.status(200).json({
    name,
    title: `${name}`,
    description: `This is a sample description for actor ${name}.`,
    inputSchema: {
      properties: {
        url: { type: 'string', title: 'Target URL', description: 'URL to scrape' },
        maxResults: { type: 'number', title: 'Max Results', description: 'Maximum number of results' },
        headless: { type: 'boolean', title: 'Headless Mode', description: 'Run in headless mode' },
      },
      required: ['url'],
    },
    stats: {
      runs: 12,
      lastRun: '2025-07-30T12:00:00Z',
      status: 'IDLE',
    },
    lastResult: {
      log: 'Sample log output...\nActor completed successfully.',
      output: { data: [1,2,3] },
    },
  });
}
