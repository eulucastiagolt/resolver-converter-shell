export { convertVideo, convertMultiple, checkFfmpeg, getAudioTracks } from './converter.js';
export type {
  ConvertOptions,
  ConvertResult,
  AudioTrack,
  FileInfo,
  FFmpegPreset,
} from './types/index.js';
export { expandGlobPattern } from './utils/glob-expander.js';
export { isVideoFile, fileExists, generateOutputFilename } from './utils/file-validator.js';
export { 
  setupSignalHandlers, 
  cancel, 
  isProcessCancelled,
  resetCancellation,
  setCurrentCommand,
  clearCurrentCommand
} from './utils/signal-handler.js';
