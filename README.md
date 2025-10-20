# Resolver Converter

Command-line tool for converting videos to DaVinci Resolve compatible format, designed to solve video compatibility issues when using DaVinci Resolve on Linux systems.

## 📋 Requirements

- Bash (GNU Bash 4.0 or higher)
- FFmpeg (for video conversion)

## 🚀 Installation

### Method 1: Quick Install (Recommended)

Run the following command to install or update:

```bash
curl -sL https://raw.githubusercontent.com/eulucastiagolt/resolver-converter-shell/main/install.sh | bash
```

### Method 2: Manual Installation

1. Download the script:

    ```bash
    curl -O https://raw.githubusercontent.com/eulucastiagolt/resolver-converter-shell/main/resolver-converter.sh
    chmod +x resolver-converter.sh
    ```

2. (Optional) Install globally:

    ```bash
    sudo mv resolver-converter.sh /usr/local/bin/resolver-converter
    ```

## 🛠 How to Use

### Basic Syntax

```bash
resolver-converter -i INPUT_FILE -o OUTPUT_DIRECTORY
```

### Options

| Option          | Description                                  |
| --------------- | -------------------------------------------- |
| `-i, --input`   | Input video file (supports wildcards like *.mp4) |
| `-o, --output`  | Output directory for converted video(s)      |
| `-m, --map-audio` | Map specific audio tracks (e.g., 1,3,5)      |
| `-h, --help`    | Show help message                           |

### Usage Examples

1. **Convert a single file**:

   ```bash
   resolver-converter -i "my video.mp4" -o ./output
   ```

2. **Convert multiple files using wildcard**:

   ```bash
   resolver-converter -i *.mp4 -o ./converted_videos
   ```

3. **Select specific audio tracks**:

   ```bash
   resolver-converter -i video.mp4 -o ./output -m 1,3
   ```

   This command will include only audio tracks 1 and 3 in the output file.

4. **Files with spaces in the name**:

   ```bash
   resolver-converter -i "my video with spaces.mkv" -o ./output
   ```

5. **Files with multiple dots in the name**:

   ```bash
   resolver-converter -i "video.2023.10.18.final.mp4" -o ./output
   ```

   Will be converted to: `video.2023.10.18.final.mov`

### Features

- Supports multiple input video formats
- Preserves complex filenames with multiple dots
- Handles spaces in filenames correctly
- Automatically creates output directory if it doesn't exist
- Detailed feedback during conversion process
- Supports selection of specific audio tracks
- Automatic dependency check (FFmpeg)
- Simplified global installation

### More Examples

1. Convert a single file:

    ```bash
    # If installed globally:
    resolver-converter -i video.mp4 -o ./output

    # If using locally:
    ./resolver-converter.sh -i video.mp4 -o ./output
    ```

2. Convert all files in a directory:

    ```bash
    # Convert all .mp4 files in the directory:
    resolver-converter -i *.mp4 -o ./output

    # Specify multiple files:
    resolver-converter -i "video1.mp4 video2.mp4 video3.mp4" -o ./output

    # Use wildcards in subdirectories:
    resolver-converter -i "./**/*.mp4" -o ./output
    ```

3. Use absolute paths:

    ```bash
    resolver-converter --input /path/to/video.avi --output /path/to/output
    ```

## 🔄 Supported Formats

The script uses FFmpeg for conversion, so any video format supported by FFmpeg can be used as input. The output will be in `.mov` format with MPEG-4 codec and PCM audio, which is widely compatible with DaVinci Resolve.

## ❓ Help

To see all available options:

```bash
resolver-converter --help
```

## 📝 Notes

- The script will automatically create the output directory if it doesn't exist.
- If any error occurs during conversion, an error message will be displayed.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Developed by [Lucas Tiago](https://github.com/eulucastiagolt) | [www.lucastiago.com.br](https://www.lucastiago.com.br)
