export function slugify(input) {
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')     // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')         // spaces/punctuation -> dashes
    .replace(/^-+|-+$/g, '')
}