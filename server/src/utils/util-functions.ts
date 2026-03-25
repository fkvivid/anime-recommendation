export const getBaseTitle = (title: string): string => {
    if (!title) return '';
    let base = title.toLowerCase();
    // Remove "season X", "part X", subtitles after colon, etc.
    base = base.replace(/\s*season\s*\d+/g, '');
    base = base.replace(/\s*\d+(st|nd|rd|th)\s*season/g, '');
    base = base.replace(/\s*part\s*\d+/g, '');
    // Keep everything before colon if there's a colon
    if (base.includes(':')) {
        base = base.split(':')[0] || '';
    }
    // Keep everything before hyphen if there's a hyphen
    if (base.includes('-')) {
        base = base.split('-')[0] || '';
    }
    // Remove trailing punctuation
    return base.trim().replace(/[-~]$/, '').trim();
};