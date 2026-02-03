/**
 * Formats a memory limit string by adding a space between the number and the unit.
 * @param value - The memory limit string to format (e.g., "512MiB", "1GiB")
 * @returns The formatted string with a space between number and unit (e.g., "512 MiB", "1 GiB")
 */
export const formatMemoryLimit = (value: string): string =>
  value.replace(/(\d)([a-zA-Z])/g, "$1 $2");
