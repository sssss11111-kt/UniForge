/** Evidence retained with imported content and all future derived claims. */
export interface ContentProvenance {
  sourceEventId: string;
  capturedAt: string;
  locator: string;
  checksum?: string;
  license?: string;
}

export const sourceProvenance = (source: {
  id: string;
  capturedAt: string;
  locator: string;
  checksum?: string;
  license?: string;
}): ContentProvenance => ({
  sourceEventId: source.id,
  capturedAt: source.capturedAt,
  locator: source.locator,
  ...(source.checksum === undefined ? {} : { checksum: source.checksum }),
  ...(source.license === undefined ? {} : { license: source.license }),
});
