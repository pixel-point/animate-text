export function flattenNode(node) {
  if ('children' in node) return node.children.map((child) => flattenNode(child)).join('');
  if ('value' in node) return node.value;
  return '';
}

function splitPath(path) {
  return path.split('/').filter((segment) => segment.length > 0);
}

export function joinPath(...paths) {
  const out = [];
  const parsed = paths.flatMap(splitPath);

  for (const segment of parsed) {
    switch (segment) {
      case '..':
        out.pop();
        break;
      case '.':
        break;
      default:
        out.push(segment);
    }
  }

  return out.join('/');
}

export function slash(path) {
  if (path.startsWith('\\\\?\\')) {
    return path;
  }

  return path.replaceAll('\\', '/');
}
