// Updated: September 2026 - URL utility functions
import Path from "./paths";


export const getImageUrl = (filename: string): string =>
  `${Path.server}/files/${filename}`;