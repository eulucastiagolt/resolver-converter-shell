#!/bin/bash
#By Lucas Tiago www.lucastiago.com.br
#Version 0.2
#Script to convert video files to DaVinci Resolve compatible format.
#FFmpeg is required for this script to work.

check_ffmpeg() {
  if ! command -v ffmpeg &>/dev/null; then
    echo "Error: FFmpeg is not installed or not in PATH." >&2
    echo "Please install FFmpeg before continuing." >&2
    echo "On Ubuntu/Debian: sudo apt install ffmpeg" >&2
    echo "On Fedora: sudo dnf install ffmpeg" >&2
    echo "On Arch Linux: sudo pacman -S ffmpeg" >&2
    exit 1
  fi
}

validate_video_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    echo "Error: The file '$file' does not exist." >&2
    return 1
  fi

  if ! file --mime-type "$file" | grep -q video/; then
    echo "Error: The file '$file' does not appear to be a supported video file." >&2
    return 1
  fi

  # if ! ffmpeg -v error -i "$file" -f null - 2>&1 | grep -q 'Error'; then
  #   return 0
  # else
  #   echo "Error: FFmpeg could not process the file '$file'." >&2
  #   return 1
  # fi
}
check_ffmpeg

CODEC_DAVINCI=".mov"                                                       #Codec accepted by DaVinci Resolve on Linux
PRESET_FFMPEG=(-codec:v mpeg4 -q:v 0 -codec:a pcm_s16le -map 0:v -map 0:a) #FFmpeg preset

show_help() {
  echo "Usage: resolver-converter [OPTIONS]"
  echo "Convert video files to DaVinci Resolve compatible format."
  echo ""
  echo "Options:"
  echo "  -i, --input FILE        Input video file"
  echo "  -o, --output DIRECTORY  Output directory for converted file"
  echo "  -h, --help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  resolver-converter -i input.mp4 -o ./output"
  echo "  resolver-converter --input video.avi --output /path/to/output"
  exit 0
}

# Process arguments
while [[ "$#" -gt 0 ]]; do
  case "$1" in
  -i | --input)
    if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
      ARG_INPUT="$2"
      shift 2
    else
      echo "Error: $1 requires an argument (Input file)." >&2
      exit 1
    fi
    ;;
  -o | --output)
    if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
      ARG_OUTPUT="$2"
      shift 2
    else
      echo "Error: $1 requires an argument (Output directory)." >&2
      exit 1
    fi
    ;;
  -m | --map-audio)
    if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
      ARG_MAP_AUDIO="$2"
      shift 2
    else
      echo "Error: $1 requires a comma-separated list of audio track indices (e.g., 1,5,3)." >&2
      exit 1
    fi
    ;;
  -h | --help)
    show_help
    ;;
  *)
    echo "Error: Invalid option: $1" >&2
    echo "Use -h or --help to see available options." >&2
    exit 1
    ;;
  esac
done

if [ -z "$ARG_INPUT" ] || [ -z "$ARG_OUTPUT" ]; then
  echo "Error: Insufficient arguments." >&2
  echo "Use -h or --help to see usage." >&2
  exit 1
fi

# Create output directory if it doesn't exist
if [ ! -d "$ARG_OUTPUT" ]; then
  echo "Output directory does not exist. Creating directory..."
  if ! mkdir -p "$ARG_OUTPUT"; then
    echo "Error: Failed to create directory $ARG_OUTPUT" >&2
    exit 1
  fi
  echo "Directory created"
fi

echo "================================="
echo "Starting conversion"

for INPUT_FILE in "$ARG_INPUT"; do
  if [ ! -f "$INPUT_FILE" ]; then
    echo "Warning: File not found or pattern did not match: $INPUT_FILE. Skipping."
    continue
  fi

  BASENAME=$(basename -- "$INPUT_FILE")
  # Remove only the last extension while preserving other dots in the filename
  FILE_NAME="${BASENAME%.*}"
  # If the filename has no extension, FILE_NAME will be empty, so we use the original basename
  [ -z "$FILE_NAME" ] && FILE_NAME="$BASENAME"
  # Get the extension (everything after the last dot)
  EXTENSION="${BASENAME##*.}"
  # If the extension is the same as the filename (no extension), don't remove anything
  [ "$EXTENSION" = "$BASENAME" ] && FILE_NAME="$BASENAME"
  OUTPUT_FILE_NAME="$FILE_NAME$CODEC_DAVINCI"
  OUTPUT_PATH="${ARG_OUTPUT%/}/$OUTPUT_FILE_NAME"

  echo ""
  echo "--- Processing: $INPUT_FILE ---"
  echo "Output directory: ${ARG_OUTPUT%/}"
  echo "Output file: $OUTPUT_FILE_NAME"
  echo "Full path: $OUTPUT_PATH"

  # Validate video file
  echo "Validating video file..."
  if ! validate_video_file "$INPUT_FILE"; then
    echo "Warning: Skipping invalid file: $INPUT_FILE" >&2
    continue
  fi

   local BASE_PRESET=(-codec:v mpeg4 -q:v 0 -codec:a pcm_s16le)
  local FFMPEG_COMMAND=("ffmpeg" "-i" "$INPUT_FILE")

  if [ -n "$ARG_MAP_AUDIO" ]; then
    FFMPEG_COMMAND+=("-map" "0:v:0")
    IFS=',' read -r -a AUDIO_TRACKS <<< "$ARG_MAP_AUDIO"
    for track_index in "${AUDIO_TRACKS[@]}"; do
      FFMPEG_COMMAND+=("-map" "0:${track_index}")
    done
  else
    FFMPEG_COMMAND+=("-map" "0:v" "-map" "0:a")
  fi

  FFMPEG_COMMAND+=("${BASE_PRESET[@]}")
  FFMPEG_COMMAND+=("$OUTPUT_PATH")

  if "${FFMPEG_COMMAND[@]}"; then
    echo "Conversion of $INPUT_FILE completed successfully!"
  else
    echo "Error: Conversion of $INPUT_FILE failed. Check FFmpeg messages for details." >&2
  fi
done

# Restore nullglob to default
shopt -u nullglob

# If no files were processed
if [ "$ARG_INPUT" != "" ] && [ -z "$INPUT_FILE" ]; then
  echo "Warning: No files found matching pattern: $ARG_INPUT" >&2
  exit 1
fi

exit 0
