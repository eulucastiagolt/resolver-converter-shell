# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-04-05

### Added
- TypeScript/JavaScript implementation as npm package `@ltcode/rconv`
- CLI tool `rconv` with same interface as shell script
- Library API for programmatic usage
- Support for Bun and Node.js
- GitHub Actions for automated testing and publishing
- Full TypeScript types and declarations

### Features
- Convert videos to DaVinci Resolve compatible format (.mov, MPEG-4 + PCM audio)
- Wildcard and glob pattern support (`*.mp4`, `*.mkv`)
- Recursive directory search with preserved structure (`-r` flag)
- Audio track selection (`-m` flag)
- Ctrl+C handler to cancel all conversions
- Progress callbacks for library usage

### Migration from Shell Script
- Shell script moved to `legacy/` folder
- Original install script still works via `curl | bash`
- Users can choose between npm/bun install or legacy shell script

---

## Legacy Shell Script Versions

### [0.7] - 2024-04-05
- Added `-v/--version` flag

### [0.6] - 2024-04-05
- Fixed directory structure preservation for absolute paths in recursive mode

### [0.5] - 2024-04-05
- Ctrl+C now cancels entire queue, not just current video

### [0.4] - 2024-04-05
- Added `-r/--recursive` flag for subdirectory search
- Preserves directory structure in output

### [0.3] - 2024-04-05
- Fixed wildcard expansion with spaces in paths
- Removed incorrect `local` keyword usage
- Added `-m/--map-audio` documentation in help

### [0.2] - Initial shell script release
- Basic video conversion to DaVinci Resolve format
- Support for wildcards and multiple files
- Audio track mapping