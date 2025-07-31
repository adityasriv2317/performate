import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'performate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');
    const user = await users.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });
    const now = new Date();
    await users.updateOne({ username }, { $set: { lastLogin: now } });
    return res.status(200).json({ message: 'Login successful', apiKey: user.apiKey, lastLogin: now });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
}
