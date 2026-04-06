export { convertVideo, convertMultiple, checkFfmpeg } from './converter';
export type {
  ConvertOptions,
  ConvertResult,
  FileInfo,
  FFmpegPreset,
} from './types';
export { expandGlobPattern } from './utils/glob-expander';
export { isVideoFile, fileExists, generateOutputFilename } from './utils/file-validator';
export { setupSignalHandlers, cancel, isProcessCancelled } from './utils/signal-handler';