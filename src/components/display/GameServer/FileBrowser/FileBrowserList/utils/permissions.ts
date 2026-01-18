export function formatUnixPerms(mode?: number) {
  if (mode == null) return { rwx: "---------", octal: "---" };

  const m = mode & 0o7777;
  const permBits = m & 0o777;

  const triples = [(permBits >> 6) & 7, (permBits >> 3) & 7, permBits & 7];
  const rwxTriple = (n: number) => `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;

  let rwx = triples.map(rwxTriple).join("");

  const suid = (m & 0o4000) !== 0;
  const sgid = (m & 0o2000) !== 0;
  const sticky = (m & 0o1000) !== 0;

  if (suid) rwx = rwx.substring(0, 2) + (rwx[2] === "x" ? "s" : "S") + rwx.substring(3);
  if (sgid) rwx = rwx.substring(0, 5) + (rwx[5] === "x" ? "s" : "S") + rwx.substring(6);
  if (sticky) rwx = rwx.substring(0, 8) + (rwx[8] === "x" ? "t" : "T");

  const octal = (m & 0o777).toString(8).padStart(3, "0");
  return { rwx, octal };
}
