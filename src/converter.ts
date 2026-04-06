import ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { ConvertOptions, ConvertResult } from './types/index.js';
import { generateOutputFilename } from './utils/file-validator.js';
import { expandGlobPattern, getRelativePath } from './utils/glob-expander.js';
import { removeTrailingSlash, getBaseDir } from './utils/path-utils.js';
import { isProcessCancelled, setupSignalHandlers } from './utils/signal-handler.js';

const DEFAULT_CODEC = {
  video: 'mpeg4',
  audio: 'pcm_s16le',
  quality: 0,
  extension: '.mov',
};

export async function convertVideo(options: ConvertOptions): Promise<ConvertResult> {
  const { input, output, audioTracks, onProgress, onStart, onComplete, onError } = options;

  if (!existsSync(input)) {
    const error = new Error(`Input file not found: ${input}`);
    onError?.(input, error);
    return { input, output: '', success: false, error };
  }

  const outputDir = removeTrailingSlash(output);
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputFilename = generateOutputFilename(input, DEFAULT_CODEC.extension);
  const outputPath = join(outputDir, outputFilename);

  onStart?.(input);

  return new Promise<ConvertResult>((resolve) => {
    let command = ffmpeg(input);

    command = command
      .videoCodec(DEFAULT_CODEC.video)
      .audioCodec(DEFAULT_CODEC.audio);

    if (audioTracks && audioTracks.length > 0) {
      command = command.outputOptions(['-map', '0:v:0']);
      for (const track of audioTracks) {
        command = command.outputOptions(['-map', `0:${track}`]);
      }
    } else {
      command = command.outputOptions(['-map', '0:v', '-map', '0:a']);
    }

    command = command.outputOptions(['-q:v', String(DEFAULT_CODEC.quality)]);

    command
      .on('progress', (progress) => {
        const percent = progress.percent || 0;
        onProgress?.(percent, input);
      })
      .on('end', () => {
        onComplete?.(input);
        resolve({ input, output: outputPath, success: true });
      })
      .on('error', (err) => {
        onError?.(input, err);
        resolve({ input, output: outputPath, success: false, error: err });
      })
      .save(outputPath);
  });
}

export async function convertMultiple(options: ConvertOptions): Promise<ConvertResult[]> {
  const { input, output, recursive, audioTracks, onProgress, onStart, onComplete, onError } = options;

  setupSignalHandlers();

  let baseDir: string | undefined;
  
  if (recursive) {
    if (input.includes('/')) {
      baseDir = getBaseDir(input);
    } else {
      baseDir = process.cwd();
    }
  }

  const files = await expandGlobPattern(input, recursive);

  if (files.length === 0) {
    const error = new Error(`No files found matching pattern: ${input}`);
    return [{ input, output: '', success: false, error }];
  }

  const results: ConvertResult[] = [];

  for (const file of files) {
    if (isProcessCancelled()) {
      break;
    }

    let currentOutputDir = removeTrailingSlash(output);

    if (recursive && baseDir) {
      const fileDir = dirname(file);
      const relative = getRelativePath(fileDir, baseDir);
      
      // Só cria subdiretório se houver um caminho relativo válido
      if (relative) {
        currentOutputDir = join(output, relative);
      }
    }

    if (!existsSync(currentOutputDir)) {
      mkdirSync(currentOutputDir, { recursive: true });
    }

    const result = await convertVideo({
      input: file,
      output: currentOutputDir,
      audioTracks,
      onProgress,
      onStart,
      onComplete,
      onError,
    });

    results.push(result);
  }

  return results;
}

export function checkFfmpeg(): boolean {
  return true;
}