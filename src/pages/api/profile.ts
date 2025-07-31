import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'performate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { username } = req.query;
  if (!username || typeof username !== 'string') return res.status(400).json({ error: 'Username required' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');
    const user = await users.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ username: user.username, lastLogin: user.lastLogin });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
}
