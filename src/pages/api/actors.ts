import { create } from "domain";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  const apiKey = req.headers["x-apify-api-key"] || req.query.apiKey;
  if (!apiKey || typeof apiKey !== "string")
    return res.status(401).json({ error: "API key required" });

  try {
    const response = await fetch(
      "https://api.apify.com/v2/acts?token=" + encodeURIComponent(apiKey)
    );
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: "Failed to fetch actors" });
    const data = await response.json();
    const actors = (data.data?.items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      username: item.username,
      title: item.title || item.name,
      createdAt: item.createdAt || new Date().toISOString(),
    }));
    return res.status(200).json({ actors });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
