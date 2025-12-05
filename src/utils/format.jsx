export function formatDateShort(input) {
    if (!input) return '';
    try {
        const d = new Date(input);
        if (isNaN(d)) return String(input);
        return d.getFullYear().toString();
    } catch {
        return String(input);
    }
}
