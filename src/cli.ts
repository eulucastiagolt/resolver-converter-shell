#!/usr/bin/env bun
import { createRequire } from 'node:module';
import { cac } from 'cac';
import { convertMultiple, checkFfmpeg } from './converter.js';
import type { ConvertOptions } from './types/index.js';
import { isProcessCancelled, setupSignalHandlers } from './utils/signal-handler.js';
import { runTui } from './tui/index.js';
import { checkForUpdate, formatUpdateMessage } from './utils/update-checker.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

export async function runCli(): Promise<void> {
  const cli = cac('rconv');

  cli
    .version(version)
    .usage('rconv [options]')
    .help();

  cli
    .option('-i, --input <pattern>', 'Input video file or pattern (e.g., *.mp4, *.mkv)')
    .option('-o, --output <directory>', 'Output directory for converted files')
    .option('-r, --recursive', 'Search recursively in subdirectories')
    .option('-m, --map-audio <tracks>', 'Map specific audio tracks (comma-separated, e.g., 1,3,5)');

  cli.command('tui', 'Open the interactive rconv control panel');

  const { options } = cli.parse(process.argv, { run: false });

  if (cli.matchedCommandName === 'tui') {
    const latestVersion = await checkForUpdate(version);
    if (latestVersion) {
      console.warn(formatUpdateMessage(version, latestVersion));
    }
    await runTui();
    return;
  }

  setupSignalHandlers();

  if (!options.input || !options.output) {
    if (options.help || options.version) {
      return;
    }
    
    console.error('Error: Missing required options --input and --output');
    console.error('Use --help to see available options');
    process.exit(1);
  }

  if (!checkFfmpeg()) {
    console.error('Error: FFmpeg is not installed or not in PATH.');
    console.error('');
    console.error('Please install FFmpeg:');
    console.error('  Ubuntu/Debian: sudo apt install ffmpeg');
    console.error('  Fedora: sudo dnf install ffmpeg');
    console.error('  Arch Linux: sudo pacman -S ffmpeg');
    console.error('  macOS: brew install ffmpeg');
    process.exit(1);
  }

  const latestVersion = await checkForUpdate(version);
  if (latestVersion) {
    console.warn(formatUpdateMessage(version, latestVersion));
  }

  const audioTracks = options.mapAudio
    ? String(options.mapAudio).split(',').map((track) => Number(track.trim()))
    : undefined;

  if (audioTracks?.some((track) => !Number.isInteger(track) || track < 0)) {
    console.error('Error: --map-audio must contain non-negative integer stream indices, for example: 1,3,5');
    process.exit(1);
  }

  const convertOptions: ConvertOptions = {
    input: options.input as string,
    output: options.output as string,
    recursive: !!options.recursive,
    audioTracks,
    onStart: (file) => {
      console.log('');
      console.log(`--- Processing: ${file} ---`);
    },
    onProgress: (percent) => {
      if (percent > 0) {
        console.log(`Progress: ${percent.toFixed(1)}%`);
      }
    },
    onComplete: (file) => {
      console.log(`✓ Conversion of ${file} completed successfully!`);
    },
    onError: (file, error) => {
      console.error(`✗ Error converting ${file}:`);
      console.error(error.message);
    },
  };

  console.log('=================================');
  console.log('Starting conversion');
  console.log('');

  const results = await convertMultiple(convertOptions);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('');
  console.log('=================================');
  console.log(`Completed: ${successful.length} files converted successfully`);

  if (isProcessCancelled()) {
    console.log('Conversion cancelled');
    process.exit(1);
  }
  
  if (failed.length > 0) {
    console.log(`Failed: ${failed.length} files failed to convert`);
    process.exit(1);
  }

  process.exit(0);
}

runCli().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
