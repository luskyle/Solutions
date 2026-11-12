export function decodeText(bytes, legacyEncoding) {
  if (legacyEncoding !== undefined && legacyEncoding !== 'gb18030') {
    throw new Error('The only supported legacy fallback is gb18030');
  }
  const bomEncoding = bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf-16le'
    : bytes[0] === 0xfe && bytes[1] === 0xff ? 'utf-16be' : undefined;
  const encoding = bomEncoding || 'utf-8';
  try {
    return { text: new TextDecoder(encoding, { fatal: true }).decode(bytes), encoding };
  } catch (error) {
    if (bomEncoding || !legacyEncoding) {
      throw new Error(`Cannot decode as ${encoding}; for legacy Chinese files explicitly enable GB18030 fallback`, { cause: error });
    }
    return { text: new TextDecoder(legacyEncoding, { fatal: true }).decode(bytes), encoding: legacyEncoding };
  }
}
