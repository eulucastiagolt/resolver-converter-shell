#!/bin/bash
#By Lucas Tiago www.lucastiago.com.br
#Versão 0.2
#Script que converte arquivos de vídeo para o formato suportado no Davinci Resolve.
#É necessário FFmpeg para funcionar.

check_ffmpeg() {
  if ! command -v ffmpeg &>/dev/null; then
    echo "Erro: FFmpeg não está instalado ou não está no PATH." >&2
    echo "Por favor, instale o FFmpeg antes de continuar." >&2
    echo "No Ubuntu/Debian: sudo apt install ffmpeg" >&2
    echo "No Fedora: sudo dnf install ffmpeg" >&2
    echo "No Arch Linux: sudo pacman -S ffmpeg" >&2
    exit 1
  fi
}

validate_video_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    echo "Erro: O arquivo '$file' não existe." >&2
    return 1
  fi

  if ! file --mime-type "$file" | grep -q video/; then
    echo "Erro: O arquivo '$file' não parece ser um vídeo suportado." >&2
    return 1
  fi

  if ! ffmpeg -v error -i "$file" -f null - 2>&1 | grep -q 'Error'; then
    return 0
  else
    echo "Erro: O arquivo '$file' não pôde ser processado pelo FFmpeg." >&2
    return 1
  fi
}
check_ffmpeg

CODEC_DAVINCI=".mov"                                     #Codec aceito  pelo Davinci Resolvi no Linux
PRESET_FFMPEG=(-codec:v mpeg4 -q:v 0 -codec:a pcm_s16le) #Preset do FFmpeg

show_help() {
  echo "Uso: resolver-converter [OPÇÕES]"
  echo "Converte arquivos de vídeo para o formato compatível com o DaVinci Resolve."
  echo ""
  echo "Opções:"
  echo "  -i, --input ARQUIVO     Arquivo de vídeo de entrada"
  echo "  -o, --output DIRETÓRIO  Diretório de saída para o arquivo convertido"
  echo "  -h, --help              Mostra esta mensagem de ajuda"
  echo ""
  echo "Exemplos:"
  echo "  resolver-converter -i entrada.mp4 -o ./saida"
  echo "  resolver-converter --input video.avi --output /caminho/para/saida"
  exit 0
}

while [[ "$#" -gt 0 ]]; do
  case "$1" in
  -i | --input)
    if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
      ARG_INPUT="$2"
      shift 2
    else
      echo "Erro: $1 requer um argumento (Arquivo de entrada)." >&2
      exit 1
    fi
    ;;
  -o | --output)
    if [ -n "$2" ] && [ "${2:0:1}" != "-" ]; then
      ARG_OUTPUT="$2"
      shift 2
    else
      echo "Erro: $1 requer um argumento (Diretório de saída)." >&2
      exit 1
    fi
    ;;
  -h | --help)
    show_help
    ;;
  *)
    echo "Erro: Opção inválida: $1" >&2
    echo "Use -h ou --help para ver as opções disponíveis." >&2
    exit 1
    ;;
  esac
done

if [ -z "$ARG_INPUT" ] || [ -z "$ARG_OUTPUT" ]; then
  echo "Erro: Argumentos insuficientes." >&2
  echo "Use -h ou --help para ver o modo de uso." >&2
  exit 1
fi

if [ -d "$ARG_OUTPUT" ]; then
  echo "Diretório de saída existe"
else
  echo "Diretório de saída não existe. Criando diretório..."
  if ! mkdir -p "$ARG_OUTPUT"; then
    echo "Erro: Falha ao criar o diretório $ARG_OUTPUT" >&2
  fi
  echo "Diretório criado"
fi

echo "================================="
echo "Iniciando a conversão"

for INPUT_FILE in "$ARG_INPUT"; do
  if [ ! -f "$INPUT_FILE" ]; then
    echo "Aviso: Arquivo não encontrado ou padrão sem correspondência: $INPUT_FILE. Pulando."
    continue
  fi

  BASENAME=$(basename -- "$INPUT_FILE")
  FILE_NAME="${BASENAME%.*}"
  OUTPUT_FILE_NAME="$FILE_NAME$CODEC_DAVINCI"
  OUTPUT_PATH="${ARG_OUTPUT%/}/$OUTPUT_FILE_NAME"

  echo ""
  echo "--- Processando: $INPUT_FILE ---"
  echo "Diretório de destino: ${ARG_OUTPUT%/}"
  echo "Arquivo de saída: $OUTPUT_FILE_NAME"
  echo "Caminho completo: $OUTPUT_PATH"

  # Validar o arquivo de vídeo
  echo "Validando arquivo de vídeo..."
  if ! validate_video_file "$INPUT_FILE"; then
    echo "Aviso: Pulando arquivo inválido: $INPUT_FILE" >&2
    continue
  fi

  if ffmpeg -i "$INPUT_FILE" "${PRESET_FFMPEG[@]}" "$OUTPUT_PATH"; then
    echo "Conversão de $INPUT_FILE concluída com sucesso!"
  else
    echo "Erro: A conversão de $INPUT_FILE falhou. Verifique as mensagens do FFmpeg." >&2
  fi

done

exit 0
