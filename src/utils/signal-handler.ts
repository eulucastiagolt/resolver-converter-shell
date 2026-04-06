let isCancelled = false;

export function cancel(): void {
  isCancelled = true;
}

export function isProcessCancelled(): boolean {
  return isCancelled;
}

export function resetCancellation(): void {
  isCancelled = false;
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