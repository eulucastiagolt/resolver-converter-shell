export interface ConvertOptions {
  input: string;
  output: string;
  recursive?: boolean;
  audioTracks?: number[];
  onProgress?: (percent: number, file: string) => void;
  onStart?: (file: string) => void;
  onComplete?: (file: string) => void;
  onError?: (file: string, error: Error) => void;
}

export interface ConvertResult {
  input: string;
  output: string;
  success: boolean;
  error?: Error;
}

export interface FileInfo {
  path: string;
  basename: string;
  dirname: string;
  extension: string;
  isValidVideo: boolean;
}

export interface FFmpegPreset {
  codecVideo: string;
  codecAudio: string;
  qualityVideo: string;
  codecDavinci: string;
}

export const DEFAULT_PRESET: FFmpegPreset = {
  codecVideo: 'mpeg4',
  codecAudio: 'pcm_s16le',
  qualityVideo: '0',
  codecDavinci: '.mov',
};

export interface CliOptions {
  input: string;
  output: string;
  recursive: boolean;
  mapAudio?: string;
  version: boolean;
  help: boolean;
}