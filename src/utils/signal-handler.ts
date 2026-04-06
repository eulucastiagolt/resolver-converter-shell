import type { FfmpegCommand } from 'fluent-ffmpeg';

let isCancelled = false;
let currentCommand: FfmpegCommand | null = null;

export function cancel(): void {
  isCancelled = true;
  
  // Mata o comando FFmpeg atual se existir
  if (currentCommand) {
    try {
      currentCommand.kill('SIGTERM');
    } catch {
      try {
        currentCommand.kill('SIGKILL');
      } catch {}
    }
  }
}

export function isProcessCancelled(): boolean {
  return isCancelled;
}

export function resetCancellation(): void {
  isCancelled = false;
}

export function setCurrentCommand(command: FfmpegCommand | null): void {
  currentCommand = command;
}

export function clearCurrentCommand(): void {
  currentCommand = null;
}

export function setupSignalHandlers(): void {
  const handler = () => {
    console.log('');
    console.log('Cancellation requested. Stopping all conversions...');
    cancel();
    process.exit(1);
  };

  process.on('SIGINT', handler);
  process.on('SIGTERM', handler);
}

export function removeSignalHandlers(): void {
  process.removeAllListeners('SIGINT');
  process.removeAllListeners('SIGTERM');
}