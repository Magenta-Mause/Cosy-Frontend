export function splitPath(path: string) {
  if (!path || path === "/") return [];
  return path.split("/").filter(Boolean);
}

export function buildCrumbs(currentPath: string) {
  const segs = splitPath(currentPath);
  const crumbs: Array<{ label: string; path: string }> = [];
  let acc = "";
  for (const seg of segs) {
    acc += `/${seg}`;
    crumbs.push({ label: seg, path: acc });
  }
  return crumbs;
}
