import "server-only";
import sanitizeHtml from "sanitize-html";
import { SUPABASE_URL, IMAGE_BUCKET } from "@/lib/env";

const imagePrefix = `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/`;

/**
 * Allow-list for article HTML. Matches what the editor can produce; anything
 * else (scripts, event handlers, iframes, styles, foreign images) is removed.
 * Run on save and again on render.
 */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "h2", "h3", "strong", "em", "s", "u",
      "a", "ul", "ol", "li", "blockquote", "hr", "code", "pre", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["dir", "lang"],
    },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    exclusiveFilter: (frame) =>
      frame.tag === "img" && !String(frame.attribs.src ?? "").startsWith(imagePrefix),
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  });
}
