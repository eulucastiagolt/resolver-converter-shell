# @ltcode/rconv

[![npm version](https://img.shields.io/npm/v/@ltcode/rconv.svg)](https://www.npmjs.com/package/@ltcode/rconv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI and library for converting videos to DaVinci Resolve compatible format. Works with both Bun and Node.js.

## Features

- Convert videos to `.mov` format (MPEG-4 + PCM audio) compatible with DaVinci Resolve
- Support for wildcards and glob patterns (`*.mp4`, `*.mkv`)
- Recursive directory search with preserved structure
- Select specific audio tracks
- Ctrl+C cancels all conversions
- Works as CLI and library

## Installation

### Via npm

The package is published in the npm registry. This is the recommended global installation method:

```bash
npm install -g @ltcode/rconv
```

### Via Bun

```bash
bun install -g @ltcode/rconv
```

### Updates

`rconv` checks the npm registry once per day and notifies you when a newer version is available. Update with:

```bash
npm install -g @ltcode/rconv@latest
```

### Legacy Shell Script

For users who prefer the original shell script:

```bash
curl -sL https://raw.githubusercontent.com/eulucastiagolt/resolver-converter-shell/main/install.sh | bash
```

See [legacy/README-legacy.md](legacy/README-legacy.md) for details.

## CLI Usage

### Basic Syntax

```bash
rconv -i <input> -o <output>
```

### Options

| Option | Description |
|--------|-------------|
| `-i, --input <pattern>` | Input video file or pattern (e.g., `*.mp4`, `*.mkv`) |
| `-o, --output <dir>` | Output directory for converted files |
| `-r, --recursive` | Search recursively in subdirectories (preserves directory structure) |
| `-m, --map-audio <tracks>` | Map specific audio tracks (comma-separated, e.g., `1,3,5`) |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

### Interactive Control Center

```bash
rconv tui
```

The TUI starts in the current directory and provides a media browser, output folder creation, audio track selection, conversion progress, execution logs and cancellation controls. Use the arrow keys to navigate, `Enter` to select, `P` to type a directory path, and `N` to create a named output folder.

### Examples

```bash
# Convert a single file
rconv -i video.mp4 -o ./output

# Convert multiple files with wildcard
rconv -i "*.mp4" -o ./converted

# Convert recursively in subdirectories
rconv -r -i "*.mkv" -o ./output

# Select specific audio tracks
rconv -i video.mp4 -o ./output -m 1,3

# Use brace expansion (without quotes)
rconv -i *.{mp4,mkv,avi} -o ./output
```

## Library Usage

### Install as dependency

```bash
npm install @ltcode/rconv
# or
bun add @ltcode/rconv
```

### API

```typescript
import { convertVideo, convertMultiple } from '@ltcode/rconv';

// Convert a single video
const result = await convertVideo({
  input: 'video.mp4',
  output: './output',
  audioTracks: [1, 3], // optional
});

console.log(result.success); // true or false

// Convert multiple videos
const results = await convertMultiple({
  input: '*.mp4',
  output: './converted',
  recursive: true, // optional
  onProgress: (percent, file) => {
    console.log(`${file}: ${percent}%`);
  },
  onComplete: (file) => {
    console.log(`Done: ${file}`);
  },
  onError: (file, error) => {
    console.error(`Error: ${file} - ${error.message}`);
  },
});

// Check if FFmpeg is available
import { checkFfmpeg } from '@ltcode/rconv';

if (!checkFfmpeg()) {
  console.error('FFmpeg not found');
}
```

### Types

```typescript
import type { ConvertOptions, ConvertResult } from '@ltcode/rconv';

interface ConvertOptions {
  input: string;
  output: string;
  recursive?: boolean;
  audioTracks?: number[];
  onProgress?: (percent: number, file: string) => void;
  onStart?: (file: string) => void;
  onComplete?: (file: string) => void;
  onError?: (file: string, error: Error) => void;
}

interface ConvertResult {
  input: string;
  output: string;
  success: boolean;
  error?: Error;
}
```

## Requirements

- FFmpeg must be installed and available in PATH

### Installing FFmpeg

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# Fedora
sudo dnf install ffmpeg

# Arch Linux
sudo pacman -S ffmpeg

# macOS
brew install ffmpeg
```

## Supported Formats

Any format supported by FFmpeg can be used as input. Output is `.mov` with MPEG-4 codec and PCM audio, which is widely compatible with DaVinci Resolve on Linux.

## License

MIT - See [LICENSE](LICENSE) for details.

## Author

Lucas Tiago - [GitHub](https://github.com/eulucastiagolt) - [Website](https://www.lucastiago.com.br)
