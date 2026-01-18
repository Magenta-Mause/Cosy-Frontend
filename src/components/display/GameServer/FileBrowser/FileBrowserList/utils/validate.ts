export function validateName(name: string) {
  const n = name.trim();
  if (!n) return "Name is required.";
  if (n === "." || n === "..") return "Invalid name.";
  if (n.includes("/")) return "Name must not include '/'.";
  return null;
}
