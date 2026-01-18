export function stripLeadingSlash(p: string) {
  return p.startsWith("/") ? p.slice(1) : p;
}

export function normalizePath(p: string) {
  if (!p || p === "") return "/";
  let out = p.startsWith("/") ? p : `/${p}`;
  if (out.length > 1) out = out.replace(/\/+$/, "");
  return out;
}

export function joinRemotePath(dir: string, fileName: string) {
  const d = normalizePath(dir);
  if (d === "/") return `/${fileName}`;
  return `${d}/${fileName}`;
}

export function joinDir(base: string, name: string) {
  const b = normalizePath(base);
  if (b === "/") return `/${name}`;
  return `${b}/${name}`;
}

export function baseNameFromPath(p: string) {
  const norm = normalizePath(p);
  if (norm === "/") return "download";
  const parts = norm.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "download";
}
