const assetOrigin = process.env.NEXT_PUBLIC_ASSET_ORIGIN?.replace(/\/+$/, '');

export function getAssetUrl(path: string) {
  if (!assetOrigin || !path.startsWith('/')) {
    return path;
  }

  return `${assetOrigin}${path}`;
}
