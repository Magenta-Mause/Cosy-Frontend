export function normalizePath(p: string) {
  if (!p || p === "") return "/";
  let out = p.startsWith("/") ? p : `/${p}`;
  if (out.length > 1) out = out.replace(/\/+$/, "");
  return out;
}

export function joinRemotePath(dir: string, name: string) {
  const d = normalizePath(dir);
  if (d === "/") return `/${name}`;
  return `${d}/${name}`;
}
