/**
 * Geo coordinate utility for parsing GPS strings, addresses, and deterministic offsets
 */
export const parseIncidentCoordinates = (
  locStr: string = '',
  id: string = '',
  baseLat: number = 22.8717,
  baseLng: number = 91.0879
): { lat: number; lng: number } => {
  if (locStr) {
    // 1. Direct coordinate match for formats like "22.8717, 91.0879", "Lat: 22.87, Lng: 91.08"
    const coordMatch = locStr.match(/([0-9]{1,2}\.[0-9]{3,8})[^\d.-]+([0-9]{1,3}\.[0-9]{3,8})/);
    if (coordMatch) {
      const pLat = parseFloat(coordMatch[1]);
      const pLng = parseFloat(coordMatch[2]);
      if (pLat >= -90 && pLat <= 90 && pLng >= -180 && pLng <= 180) {
        return { lat: pLat, lng: pLng };
      }
    }

    // 2. Known regional keywords
    const lower = locStr.toLowerCase();
    if (lower.includes('sonapur')) return { lat: 22.8250, lng: 91.1000 };
    if (lower.includes('maijdee') || lower.includes('court') || lower.includes('housing')) return { lat: 22.8717, lng: 91.0879 };
    if (lower.includes('sudharam')) return { lat: 22.8690, lng: 91.0910 };
    if (lower.includes('nstu') || lower.includes('university')) return { lat: 22.7925, lng: 91.1012 };
    if (lower.includes('dhanmondi')) return { lat: 23.7461, lng: 90.3742 };
    if (lower.includes('gulshan')) return { lat: 23.7925, lng: 90.4078 };
    if (lower.includes('uttara')) return { lat: 23.8759, lng: 90.3795 };
    if (lower.includes('mirpur')) return { lat: 23.8067, lng: 90.3644 };
    if (lower.includes('dhaka')) return { lat: 23.8103, lng: 90.4125 };
    if (lower.includes('chittagong') || lower.includes('chattogram')) return { lat: 22.3569, lng: 91.7832 };
  }

  // 3. Deterministic stable offset using string hash to prevent overlapping pins
  const seed = id || locStr || 'incident';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = (((Math.abs(hash) % 120) - 60) / 10000);
  const lngOffset = (((Math.abs(hash >> 3) % 120) - 60) / 10000);

  return {
    lat: Number((baseLat + latOffset).toFixed(5)),
    lng: Number((baseLng + lngOffset).toFixed(5))
  };
};
