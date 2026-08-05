import ffmpeg from 'fluent-ffmpeg';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { AudioTrack, ConvertOptions, ConvertResult } from './types/index.js';
import { generateOutputFilename } from './utils/file-validator.js';
import { expandGlobPattern, getRelativePath } from './utils/glob-expander.js';
import { removeTrailingSlash, getBaseDir } from './utils/path-utils.js';
import { 
  isProcessCancelled, 
  setupSignalHandlers, 
  setCurrentCommand, 
  clearCurrentCommand 
} from './utils/signal-handler.js';

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

  if (isProcessCancelled()) {
    const error = new Error('Conversion cancelled');
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
    let commandLine = '';

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

    // Registra o comando ativo para poder cancelar
    setCurrentCommand(command);

    command
      .on('start', (line) => {
        commandLine = line;
      })
      .on('progress', (progress) => {
        // Verifica cancelamento durante o progress
        if (isProcessCancelled()) {
          command.kill('SIGTERM');
          return;
        }
        
        const percent = progress.percent || 0;
        onProgress?.(percent, input);
      })
      .on('end', () => {
        clearCurrentCommand();
        onComplete?.(input);
        resolve({ input, output: outputPath, success: true });
      })
      .on('error', (err, _stdout, stderr) => {
        clearCurrentCommand();
        
        // Se foi cancelado, retorna erro específico
        if (isProcessCancelled()) {
          const cancelError = new Error('Conversion cancelled');
          onError?.(input, cancelError);
          resolve({ input, output: outputPath, success: false, error: cancelError });
          return;
        }
        
        const stderrTail = stderr?.trim().split('\n')
          .filter((line) => /error|failed|invalid|matches no streams|not found/i.test(line))
          .slice(-6)
          .join('\n');
        const details = [
          err.message,
          commandLine ? `Command: ${commandLine}` : '',
          stderrTail ? `FFmpeg details:\n${stderrTail}` : '',
        ].filter(Boolean).join('\n');
        const error = new Error(details);
        onError?.(input, error);
        resolve({ input, output: outputPath, success: false, error });
      })
      .save(outputPath);
  });
}

export async function convertMultiple(options: ConvertOptions): Promise<ConvertResult[]> {
  const {
    input,
    output,
    recursive,
    audioTracks,
    onProgress,
    onStart,
    onComplete,
    onError,
    onQueue,
    manageSignals = true,
  } = options;

  if (manageSignals) {
    setupSignalHandlers();
  }

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
    const error = new Error(
      `No files found matching pattern: ${input}\nWorking directory: ${process.cwd()}\nCheck the path and the file extension. Linux distinguishes .mp4 from .MP4.`
    );
    onError?.(input, error);
    return [{ input, output: '', success: false, error }];
  }

  onQueue?.(files);

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

export function getAudioTracks(input: string): Promise<AudioTrack[]> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(input, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(data.streams
        .filter((stream) => stream.codec_type === 'audio')
        .map((stream) => ({
          index: stream.index,
          codec: stream.codec_name ?? 'unknown',
          channels: stream.channels,
          language: typeof stream.tags?.language === 'string' ? stream.tags.language : undefined,
        })));
    });
  });
}

export function checkFfmpeg(): boolean {
  const result = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return !result.error && result.status === 0;
}
