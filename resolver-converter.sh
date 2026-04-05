#!/bin/bash
#By Lucas Tiago www.lucastiago.com.br
#Version 0.5
#Script to convert video files to DaVinci Resolve compatible format.
#FFmpeg is required for this script to work.

CANCELLED=0
FFMPEG_PID=0

cancel_conversion() {
  echo ""
  echo "Cancellation requested. Stopping all conversions..."
  CANCELLED=1
  if [ -n "$FFMPEG_PID" ] && [ "$FFMPEG_PID" -gt 0 ]; then
    kill "$FFMPEG_PID" 2>/dev/null
    wait "$FFMPEG_PID" 2>/dev/null
  fi
  exit 1
}

trap cancel_conversion SIGINT SIGTERM

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
  echo "  -i, --input PATTERN     Input video file or pattern (e.g., *.mp4, *.mkv)"
  echo "  -o, --output DIRECTORY  Output directory for converted file"
  echo "  -r, --recursive         Search recursively in subdirectories"
  echo "  -m, --map-audio TRACKS  Map specific audio tracks (comma-separated, e.g., 1,3,5)"
  echo "  -h, --help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  resolver-converter -i input.mp4 -o ./output"
  echo "  resolver-converter -i \"*.mp4\" -o ./output"
  echo "  resolver-converter -r -i \"*.mkv\" -o ./output"
  echo "  resolver-converter -i \"video.*.mkv\" -o ./output"
  echo "  resolver-converter -i video.avi -o /path/to/output -m 1,3"
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
  -r | --recursive)
    ARG_RECURSIVE=1
    shift
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

INPUT_FILES=()

shopt -s nullglob
if [ -n "$ARG_RECURSIVE" ]; then
  shopt -s globstar
  if [[ "$ARG_INPUT" == */* ]]; then
    BASE_DIR="${ARG_INPUT%/*}"
    PATTERN="${ARG_INPUT##*/}"
    ESCAPED_BASE="${BASE_DIR// /\\ }"
    ESCAPED_PATTERN="${PATTERN// /\\ }"
    ESCAPED_INPUT="$ESCAPED_BASE/**/$ESCAPED_PATTERN"
  else
    ESCAPED_INPUT="**/${ARG_INPUT// /\\ }"
  fi
else
  ESCAPED_INPUT="${ARG_INPUT// /\\ }"
fi
eval "for f in $ESCAPED_INPUT; do [ -f \"\$f\" ] && INPUT_FILES+=(\"\$f\"); done"
shopt -u nullglob globstar

if [ ${#INPUT_FILES[@]} -eq 0 ]; then
  echo "Error: No files found matching pattern: $ARG_INPUT" >&2
  exit 1
fi

BASE_PRESET=(-codec:v mpeg4 -q:v 0 -codec:a pcm_s16le)

for INPUT_FILE in "${INPUT_FILES[@]}"; do
  if [ "$CANCELLED" -eq 1 ]; then
    break
  fi

  BASENAME=$(basename -- "$INPUT_FILE")
  FILE_NAME="${BASENAME%.*}"
  [ -z "$FILE_NAME" ] && FILE_NAME="$BASENAME"
  EXTENSION="${BASENAME##*.}"
  [ "$EXTENSION" = "$BASENAME" ] && FILE_NAME="$BASENAME"
  OUTPUT_FILE_NAME="$FILE_NAME$CODEC_DAVINCI"

  if [ -n "$ARG_RECURSIVE" ]; then
    INPUT_DIR=$(dirname -- "$INPUT_FILE")
    RELATIVE_DIR="${INPUT_DIR#./}"
    if [ -n "$RELATIVE_DIR" ] && [ "$RELATIVE_DIR" != "." ]; then
      CURRENT_OUTPUT_DIR="${ARG_OUTPUT%/}/$RELATIVE_DIR"
    else
      CURRENT_OUTPUT_DIR="${ARG_OUTPUT%/}"
    fi
    mkdir -p "$CURRENT_OUTPUT_DIR"
  else
    CURRENT_OUTPUT_DIR="${ARG_OUTPUT%/}"
  fi

  OUTPUT_PATH="$CURRENT_OUTPUT_DIR/$OUTPUT_FILE_NAME"

  echo ""
  echo "--- Processing: $INPUT_FILE ---"
  echo "Output directory: $CURRENT_OUTPUT_DIR"
  echo "Output file: $OUTPUT_FILE_NAME"
  echo "Full path: $OUTPUT_PATH"

  echo "Validating video file..."
  if ! validate_video_file "$INPUT_FILE"; then
    echo "Warning: Skipping invalid file: $INPUT_FILE" >&2
    continue
  fi

  FFMPEG_COMMAND=("ffmpeg" "-i" "$INPUT_FILE")

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

"${FFMPEG_COMMAND[@]}" &
FFMPEG_PID=$!
wait "$FFMPEG_PID"
FFMPEG_PID=0

if [ "$CANCELLED" -eq 1 ]; then
  break
elif [ $? -eq 0 ]; then
  echo "Conversion of $INPUT_FILE completed successfully!"
else
  echo "Error: Conversion of $INPUT_FILE failed. Check FFmpeg messages for details." >&2
fi
done

exit 0
