import { glob } from 'fast-glob';
import { isAbsolute, join, dirname, basename } from 'node:path';

export async function expandGlobPattern(
  pattern: string,
  recursive?: boolean
): Promise<string[]> {
  const options = {
    absolute: true,
    onlyFiles: true,
    dot: false,
  };

  if (recursive) {
    if (isAbsolute(pattern) || pattern.includes('/')) {
      const baseDir = dirname(pattern);
      const filePattern = basename(pattern);
      
      const recursivePattern = join(baseDir, '**', filePattern);
      return await glob(recursivePattern, options);
    } else {
      const recursivePattern = join('**', pattern);
      return await glob(recursivePattern, options);
    }
  }

  return await glob(pattern, options);
}

export function getRelativePath(absolutePath: string, baseDir: string): string {
  if (!isAbsolute(absolutePath) || !isAbsolute(baseDir)) {
    return absolutePath;
  }
  
  const normalizedBase = baseDir.endsWith('/') ? baseDir : `${baseDir}/`;
  
  if (absolutePath.startsWith(normalizedBase)) {
    return absolutePath.slice(normalizedBase.length);
  }
  
  return basename(dirname(absolutePath));
}