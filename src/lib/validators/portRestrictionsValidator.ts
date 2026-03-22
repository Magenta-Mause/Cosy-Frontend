const singlePort = /^\d{1,5}$/;
const portRange = /^\d{1,5}-\d{1,5}$/;

export const isValidPortOrRange = (value: string): boolean => {
  if (singlePort.test(value)) {
    const port = Number.parseInt(value, 10);
    return port >= 1 && port <= 65535;
  }

  if (portRange.test(value)) {
    const [startStr, endStr] = value.split("-");
    const start = Number.parseInt(startStr, 10);
    const end = Number.parseInt(endStr, 10);
    return start >= 1 && start <= 65535 && end >= 1 && end <= 65535 && start < end;
  }

  return false;
};
