/**
 * Deteksi siaran langsung YouTube (PRD-06). Memanggil YouTube Data API
 * search?eventType=live dengan cache 5 menit. Tanpa YOUTUBE_API_KEY mengembalikan
 * { live: false, reason: "no-api-key" } agar banner memakai embed live_stream.
 */
type YouTubeSearchResponse = {
  items?: { id?: { videoId?: string }; snippet?: { title?: string } }[];
};

export type LiveStatus = { live: boolean; videoId?: string; title?: string; reason?: "no-api-key" | "no-channel" | "upstream" | "error" };

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" };

function respond(body: LiveStatus, status = 200): Response {
  return Response.json(body, { status, headers: CACHE_HEADERS });
}

export async function GET(request: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = new URL(request.url).searchParams.get("channel") ?? process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

  if (!apiKey) return respond({ live: false, reason: "no-api-key" });
  if (!channelId) return respond({ live: false, reason: "no-channel" });

  const api = new URL("https://www.googleapis.com/youtube/v3/search");
  api.searchParams.set("part", "snippet");
  api.searchParams.set("channelId", channelId);
  api.searchParams.set("eventType", "live");
  api.searchParams.set("type", "video");
  api.searchParams.set("maxResults", "1");
  api.searchParams.set("key", apiKey);

  try {
    const res = await fetch(api, { next: { revalidate: 300 } });
    if (!res.ok) return respond({ live: false, reason: "upstream" });
    const json = (await res.json()) as YouTubeSearchResponse;
    const item = json.items?.[0];
    const videoId = item?.id?.videoId;
    if (!videoId) return respond({ live: false });
    return respond({ live: true, videoId, title: item?.snippet?.title });
  } catch {
    return respond({ live: false, reason: "error" });
  }
}
