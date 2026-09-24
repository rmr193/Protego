/**
 * Utility functions for formatting and normalizing incident, case, and report IDs.
 */

/**
 * Formats a raw UUID or ID into a clean, compact, human-readable reference.
 * 
 * Examples:
 *   "4ef14635-2f1b-4f25-bdcc-f067cf83b697" -> "CR-4EF14635"
 *   "20d89c71-cac5-4075-b42a-e645e0bad54b" (General Diary) -> "GD-20D89C71"
 *   "SOS-9912" -> "SOS-9912" (Preserves existing short IDs)
 * 
 * @param id - Raw UUID or identifier
 * @param type - Incident type (e.g. 'Crime Report', 'General Diary', 'SOS', 'Vehicle Theft')
 * @returns Short human-friendly ID
 */
export function formatIncidentId(id?: string | null, type?: string | null): string {
  if (!id) return 'INC-00000000';

  const trimmed = id.trim();

  // If it's already a clean short formatted ID (e.g. CR-2027-111, SOS-9912, GD-2027-205, PRT-8839, CR-4EF14635)
  if (/^(CR|GD|SOS|INC|PRT)-[A-Z0-9-]+$/i.test(trimmed) && trimmed.length <= 14) {
    return trimmed.toUpperCase();
  }

  // Determine prefix based on incident type or content
  let prefix = 'INC';
  if (type) {
    const lowerType = type.toLowerCase();
    if (
      lowerType.includes('crime') ||
      lowerType.includes('theft') ||
      lowerType.includes('robbery') ||
      lowerType.includes('assault') ||
      lowerType.includes('burglary') ||
      lowerType.includes('vandalism') ||
      lowerType.includes('harassment') ||
      lowerType.includes('snatching')
    ) {
      prefix = 'CR';
    } else if (
      lowerType.includes('diary') ||
      lowerType.includes('gd') ||
      lowerType.includes('lost') ||
      lowerType.includes('missing') ||
      lowerType.includes('misplaced')
    ) {
      prefix = 'GD';
    } else if (
      lowerType.includes('sos') ||
      lowerType.includes('panic') ||
      lowerType.includes('emergency')
    ) {
      prefix = 'SOS';
    }
  } else if (trimmed.toLowerCase().startsWith('gd-') || trimmed.toLowerCase().includes('gd')) {
    prefix = 'GD';
  } else if (trimmed.toLowerCase().startsWith('sos-') || trimmed.toLowerCase().includes('sos')) {
    prefix = 'SOS';
  } else if (trimmed.toLowerCase().startsWith('cr-') || trimmed.toLowerCase().includes('cr')) {
    prefix = 'CR';
  }

  // Extract clean alphanumeric characters
  // If it's a UUID (contains hyphens), the first block is 8 hex characters: "4ef14635"
  const firstBlock = trimmed.includes('-') ? trimmed.split('-')[0] : trimmed;
  const clean = firstBlock.replace(/[^a-zA-Z0-9]/g, '');

  const shortCode = clean.length >= 8 ? clean.slice(0, 8).toUpperCase() : clean.toUpperCase();

  return `${prefix}-${shortCode}`;
}

/**
 * Returns a short 8-character hash/slug for any raw UUID or long string.
 */
export function shortenId(id?: string | null, length: number = 8): string {
  if (!id) return '';
  const trimmed = id.trim();
  const firstBlock = trimmed.includes('-') ? trimmed.split('-')[0] : trimmed;
  const clean = firstBlock.replace(/[^a-zA-Z0-9]/g, '');
  return (clean.slice(0, length) || trimmed.slice(0, length)).toUpperCase();
}
