function isLikelyText(bytes: Uint8Array) {
  let printable = 0;
  let other = 0;

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 0) return false;

    const isWhitespace = b === 9 || b === 10 || b === 13 || b === 32;
    const isPrintableAscii = b >= 32 && b <= 126;

    if (isWhitespace || isPrintableAscii) printable++;
    else other++;
  }

  const total = printable + other;
  if (total === 0) return true;

  return printable / total >= 0.9;
}

export async function blobToTextIfLikely(blob: Blob) {
  if (blob.size > 16 * 1024) return { ok: false as const, reason: "File is larger than 16KB" };

  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);

  if (!isLikelyText(bytes)) {
    return { ok: false as const, reason: "Content doesn't look like plain text" };
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  return { ok: true as const, text };
}
