import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, username } = req.query;
  const apiKey = req.headers["x-apify-api-key"] || req.query.apiKey;

  if (
    !name ||
    typeof name !== "string" ||
    !username ||
    typeof username !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "Missing or invalid actor name or username" });
  }
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const headers = { Authorization: `Bearer ${apiKey}` };
    const actorRef = `${username}~${name}`;

    // Get actor info
    let actorInfoResponse;
    try {
      actorInfoResponse = await axios.get(
        `https://api.apify.com/v2/acts/${actorRef}`,
        { headers }
      );

      // console.log(`Successfully fetched 1`);
    } catch (err) {
      const status = (err as any).response?.status || 500;
      const message =
        (err as any).response?.data?.message || "Failed to fetch actor info";
      console.error(`Failed to fetch actor info for ${actorRef}:`, message);
      return res.status(status).json({ error: message });
    }

    const actorData = actorInfoResponse.data?.data || actorInfoResponse.data;

    if (!actorData) {
      return res
        .status(404)
        .json({ error: "Actor not found or data missing." });
    }

    let inputSchema = null;

    // get build id
    const latestBuildId = actorData.taggedBuilds?.latest?.buildId;
    console.log(
      `Latest build ID for actor ${actorRef}:`,
      actorData.taggedBuilds?.latest?.buildId
    );

    if (latestBuildId) {
      try {
        // Fetch the specific build details using its ID
        const buildInfoRes = await axios.get(
          `https://api.apify.com/v2/actor-builds/${latestBuildId}`,
          { headers }
        );

        // console.log(`Successfully fetched 2`);
        inputSchema =
          buildInfoRes.data?.data?.inputSchema ||
          buildInfoRes.data?.inputSchema;

        if (inputSchema && typeof inputSchema === "string") {
          try {
            inputSchema = JSON.parse(inputSchema);
            console.log("input schema found and parsed successfully");
          } catch (e) {
            console.warn(
              `Failed to parse input schema for build ID ${latestBuildId}:`,
              e
            );
          }
        }
      } catch (err) {
        console.warn(
          `Could not fetch input schema for build ID ${latestBuildId}:`,
          (err as any).message || err
        );
      }
    } else {
      console.warn(
        `No 'latest' build ID found for actor ${actorRef}. Cannot fetch input schema.`
      );
    }

    try {
      await axios.get(`https://api.apify.com/v2/acts/${actorRef}/builds`, {
        headers,
      });

      // console.log(`Successfully fetched 3`);
    } catch (err) {
      if ((err as any)?.response?.status !== 404) {
        console.error(
          "error fetching builds (incorrect endpoint likely):",
          err
        );
      }
    }

    res.status(200).json({
      id: actorData.id,
      userId: actorData.userId,
      name: actorData.name,
      username: actorData.username,
      description: actorData.description,
      pictureUrl: actorData.pictureUrl,
      inputSchema,
    });
  } catch (e) {
    console.error("Server error during API request:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
