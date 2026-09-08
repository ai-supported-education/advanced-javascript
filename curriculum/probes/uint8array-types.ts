const encoded: string = new Uint8Array([0x4a, 0x53]).toBase64();
const decoded: Uint8Array = Uint8Array.fromBase64(encoded);

void decoded;
