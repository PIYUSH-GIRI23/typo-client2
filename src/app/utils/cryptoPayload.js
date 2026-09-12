/**
 * Encodes sensitive authentication payload so raw credentials are not visible in plain text in DevTools Network tab.
 * The backend decryptPayloadMiddleware automatically unpacks { payload: "<encoded_string>" }.
 */
export function encodePayload(data) {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    if (typeof window !== 'undefined' && window.btoa) {
      return { payload: window.btoa(unescape(encodeURIComponent(jsonStr))) };
    }
    return { payload: Buffer.from(jsonStr).toString('base64') };
  } catch (err) {
    console.error('Payload encoding error:', err);
    return data;
  }
}
