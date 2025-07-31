import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'performate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password, apiKey } = req.body;
  if (!username || !password || !apiKey) return res.status(400).json({ error: 'All fields are required' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');
    const existing = await users.findOne({ username });
    if (existing) return res.status(409).json({ error: 'Username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const now = new Date();
    await users.insertOne({ username, password: hashed, apiKey, lastLogin: now, createdAt: now });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
}
