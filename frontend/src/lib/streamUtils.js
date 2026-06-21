export const STREAM_PLATFORMS = [
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/watch?v=... or /channel/...' },
  { id: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/yourchannel' },
  { id: 'rumble', label: 'Rumble', placeholder: 'https://rumble.com/c/YourChannel' },
];

function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const embed = u.pathname.match(/\/embed\/([^/]+)/);
    if (embed) return embed[1];
    const live = u.pathname.match(/\/live\/([^/]+)/);
    if (live) return live[1];
  } catch {
    return null;
  }
  return null;
}

function twitchChannel(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/^\/([^/]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function rumbleEmbed(url) {
  try {
    const u = new URL(url);
    if (u.pathname.includes('/embed/')) return url;
    const vid = u.pathname.match(/\/v([^/.]+)/);
    if (vid) return `https://rumble.com/embed/${vid[1]}/`;
    const ch = u.pathname.match(/\/c\/([^/]+)/);
    if (ch) return `https://rumble.com/embed/c/${ch[1]}/`;
  } catch {
    return null;
  }
  return null;
}

export function getStreamUrlForPlatform(vendor, platform) {
  if (!vendor || !platform) return '';
  if (platform === 'youtube') return vendor.stream_youtube || '';
  if (platform === 'twitch') return vendor.stream_twitch || '';
  if (platform === 'rumble') return vendor.stream_rumble || '';
  return '';
}

export function getLiveEmbedUrl(platform, rawUrl, parentHost = 'localhost') {
  if (!platform || !rawUrl) return null;
  if (platform === 'youtube') {
    const id = youtubeId(rawUrl);
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    if (rawUrl.includes('/channel/') || rawUrl.includes('/@')) {
      const channelId = rawUrl.split('/').filter(Boolean).pop();
      return `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
    }
  }
  if (platform === 'twitch') {
    const channel = twitchChannel(rawUrl);
    if (channel) {
      return `https://player.twitch.tv/?channel=${channel}&parent=${parentHost}&muted=false`;
    }
  }
  if (platform === 'rumble') {
    return rumbleEmbed(rawUrl);
  }
  return null;
}

export function getStreamThumbnail(platform, rawUrl) {
  if (!platform || !rawUrl) return null;
  if (platform === 'youtube') {
    const id = youtubeId(rawUrl);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  if (platform === 'twitch') {
    const channel = twitchChannel(rawUrl);
    if (channel) return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel}-440x248.jpg`;
  }
  if (platform === 'rumble') {
    return 'https://picsum.photos/seed/rumble/440/248';
  }
  return null;
}

/** Public archive entry — thumbnail + title only (source URL stored server-side, not shown). */
export function buildArchiveEntry(platform, sourceUrl, title) {
  const thumbnail = getStreamThumbnail(platform, sourceUrl) || 'https://picsum.photos/seed/archive/440/248';
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    platform,
    title: title || `${platform} broadcast`,
    thumbnail,
    archived_at: new Date().toISOString(),
    _source_url: sourceUrl,
  };
}

export function parseArchives(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Strip internal fields before rendering on public pages. */
export function publicArchiveView(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    platform: entry.platform,
    title: entry.title,
    thumbnail: entry.thumbnail,
    archived_at: entry.archived_at,
  };
}