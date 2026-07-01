/**
 * Converts an HTML email body into a readable plain-text approximation.
 *
 * Used to attach a `text/plain` alternative alongside the HTML part of every
 * outgoing email. A multipart/alternative message improves deliverability
 * (clients/spam filters penalize HTML-only mail) and degrades gracefully for
 * recipients that don't render HTML.
 *
 * This is intentionally lightweight (no external dependency): it strips
 * scripts/styles/comments and tags, decodes a handful of common entities, and
 * normalizes whitespace. It does not aim for pixel-perfect rendering.
 *
 * @param html the HTML body of the email
 * @returns a plain-text version of the body
 */
export function htmlToPlainText(html: string): string {
  if (!html) {
    return '';
  }

  return (
    html
      // Drop content of non-visible elements entirely.
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      // Remove HTML comments, including FCC_META / FCC_BODY_* markers.
      .replace(/<!--[\s\S]*?-->/g, '')
      // Turn block-level boundaries into line breaks before stripping tags.
      .replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      // Strip all remaining tags.
      .replace(/<[^>]+>/g, '')
      // Decode common HTML entities.
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      // Collapse runs of whitespace and blank lines.
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
  );
}
