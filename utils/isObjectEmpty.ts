export function isObjectEmpty(obj: Record<string, any> | null | undefined): boolean {
  return obj ? Object.keys(obj).length === 0 : true;
}
