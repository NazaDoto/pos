import path from "path";

export function getExtFromFilename(filename) {
  return path.extname(filename || "").toLowerCase();
}
