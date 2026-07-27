import heic2any from 'heic2any';

const CACHE_NAME = 'heic-converted-v1';

export async function convertHeicToBlobUrl(url: string): Promise<string> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(url);
  if (cached) {
    const blob = await cached.blob();
    return URL.createObjectURL(blob);
  }

  const response = await fetch(url);
  const blob = await response.blob();
  const converted = await heic2any({ blob, toType: 'image/jpeg', quality: 0.85 });
  const outputBlob = Array.isArray(converted) ? converted[0] : converted;

  await cache.put(url, new Response(outputBlob, { headers: { 'Content-Type': 'image/jpeg' } }));
  return URL.createObjectURL(outputBlob);
}

export function isHeicFile(url: string): boolean {
  return /\.heic$/i.test(url);
}