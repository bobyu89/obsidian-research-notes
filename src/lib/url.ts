/** 站內連結一律經過這裡，才會帶上 GitHub Pages 的子路徑。 */
export const url = (path = "/") => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + (path.startsWith("/") ? path : `/${path}`);
};
