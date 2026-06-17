const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ─── Raw YouTube API shapes (internal) ───────────────────────────────────────

interface YTThumbnails {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
  standard?: { url: string };
  maxres?: { url: string };
}

interface YTSearchItem {
  id: { playlistId?: string; videoId?: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: YTThumbnails;
    channelTitle: string;
  };
}

interface YTPlaylistItem {
  snippet: {
    title: string;
    description: string;
    position: number;
    thumbnails: YTThumbnails;
    resourceId: { videoId: string };
  };
}

interface YTVideoItem {
  id: string;
  contentDetails: { duration: string };
}

interface YTPaged<T> {
  items: T[];
  nextPageToken?: string;
  pageInfo: { totalResults: number };
}

// ─── Public mapped types ──────────────────────────────────────────────────────

export interface YouTubeCourse {
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  youtube_playlist_id: string;
  lesson_count: number;
}

export interface YouTubeLesson {
  title: string;
  description: string | null;
  youtube_video_id: string;
  duration_seconds: number;
  position: number;
}

export interface PagedResult<T> {
  items: T[];
  nextPageToken?: string;
  totalResults: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ytFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_YOUTUBE_API_KEY');

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set('key', apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `YouTube API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function bestThumbnail(thumbnails: YTThumbnails): string | null {
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    null
  );
}

// ISO 8601 duration (e.g. "PT1H5M30S") → seconds
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    parseInt(match[1] ?? '0', 10) * 3600 +
    parseInt(match[2] ?? '0', 10) * 60 +
    parseInt(match[3] ?? '0', 10)
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Search for educational playlists.
 * Uses videoCategoryId=27 (Education) scoped to playlists.
 */
export async function searchPlaylists(
  query: string,
  pageToken?: string,
): Promise<PagedResult<YouTubeCourse>> {
  const params: Record<string, string> = {
    part: 'snippet',
    type: 'playlist',
    q: query,
    maxResults: '20',
    relevanceLanguage: 'en',
    safeSearch: 'strict',
  };
  if (pageToken) params.pageToken = pageToken;

  const data = await ytFetch<YTPaged<YTSearchItem>>('search', params);

  const items: YouTubeCourse[] = (data.items ?? [])
    .filter((item) => item.id.playlistId)
    .map((item) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail_url: bestThumbnail(item.snippet.thumbnails),
      category: 'Education',
      youtube_playlist_id: item.id.playlistId!,
      lesson_count: 0,
    }));

  return { items, nextPageToken: data.nextPageToken, totalResults: data.pageInfo.totalResults };
}

/**
 * Fetch full details for a single playlist.
 */
export async function getPlaylistDetails(playlistId: string): Promise<YouTubeCourse> {
  const data = await ytFetch<YTPaged<YTSearchItem>>('playlists', {
    part: 'snippet,contentDetails',
    id: playlistId,
  });

  const item = data.items?.[0];
  if (!item) throw new Error(`Playlist ${playlistId} not found`);

  return {
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail_url: bestThumbnail(item.snippet.thumbnails),
    category: 'Education',
    youtube_playlist_id: playlistId,
    lesson_count: (item as any).contentDetails?.itemCount ?? 0,
  };
}

/**
 * Fetch all lessons (videos) in a playlist with their durations.
 * Makes two requests: playlistItems for order/metadata, then videos for duration.
 */
export async function getPlaylistLessons(
  playlistId: string,
  pageToken?: string,
): Promise<PagedResult<YouTubeLesson>> {
  const params: Record<string, string> = {
    part: 'snippet',
    playlistId,
    maxResults: '50',
  };
  if (pageToken) params.pageToken = pageToken;

  const data = await ytFetch<YTPaged<YTPlaylistItem>>('playlistItems', params);
  const playlistItems = data.items ?? [];

  const videoIds = playlistItems
    .map((i) => i.snippet.resourceId.videoId)
    .filter(Boolean)
    .join(',');

  const durations: Record<string, number> = {};
  if (videoIds) {
    const videoData = await ytFetch<YTPaged<YTVideoItem>>('videos', {
      part: 'contentDetails',
      id: videoIds,
    });
    for (const v of videoData.items ?? []) {
      durations[v.id] = parseDuration(v.contentDetails.duration);
    }
  }

  const items: YouTubeLesson[] = playlistItems.map((item) => {
    const videoId = item.snippet.resourceId.videoId;
    return {
      title: item.snippet.title,
      description: item.snippet.description || null,
      youtube_video_id: videoId,
      duration_seconds: durations[videoId] ?? 0,
      position: item.snippet.position,
    };
  });

  return { items, nextPageToken: data.nextPageToken, totalResults: data.pageInfo.totalResults };
}
