import fg from 'fast-glob';
import { isAbsolute, join, dirname, basename, relative, normalize } from 'node:path';

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
      return await fg(recursivePattern, options);
    } else {
      const recursivePattern = join('**', pattern);
      return await fg(recursivePattern, options);
    }
  }

  return await fg(pattern, options);
}

export function getRelativePath(absolutePath: string, baseDir: string): string {
  const normalizedPath = normalize(absolutePath);
  const normalizedBase = normalize(baseDir);
  
  const rel = relative(normalizedBase, normalizedPath);
  
  // Se for "." ou vazio, está no mesmo diretório - não cria subpasta
  if (!rel || rel === '.') {
    return '';
  }
  
  // Se começar com "..", saiu do diretório base - não cria subpasta
  if (rel.startsWith('..')) {
    return '';
  }
  
  return rel;
}