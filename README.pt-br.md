# @ltcode/rconv

[![npm version](https://img.shields.io/npm/v/@ltcode/rconv.svg)](https://www.npmjs.com/package/@ltcode/rconv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI e biblioteca para converter vídeos para formato compatível com DaVinci Resolve. Funciona com Bun e Node.js.

## Funcionalidades

- Converte vídeos para `.mov` (MPEG-4 + PCM audio) compatível com DaVinci Resolve
- Suporte a wildcards e padrões glob (`*.mp4`, `*.mkv`)
- Busca recursiva em diretórios com preservação de estrutura
- Seleção de faixas de áudio específicas
- Ctrl+C cancela todas as conversões
- Funciona como CLI e biblioteca

## Instalação

### Via npm

O pacote é publicado no registro npm. Este é o método recomendado para instalação global. A TUI interativa requer Bun 1.3 ou superior em tempo de execução:

```bash
npm install -g @ltcode/rconv
```

### Via Bun

```bash
bun install -g @ltcode/rconv
```

### Atualizações

O `rconv` consulta o registro npm uma vez por dia e avisa quando existir uma versão nova. Para atualizar:

```bash
npm install -g @ltcode/rconv@latest
```

### Shell Script (Legacy)

Para usuários que preferem o script shell original:

```bash
curl -sL https://raw.githubusercontent.com/eulucastiagolt/resolver-converter-shell/main/install.sh | bash
```

Veja [legacy/README-legacy.pt-br.md](legacy/README-legacy.pt-br.md) para detalhes.

## Uso via CLI

### Sintaxe básica

```bash
rconv -i <entrada> -o <saída>
```

### Opções

| Opção | Descrição |
|-------|-----------|
| `-i, --input <padrão>` | Arquivo de vídeo ou padrão (ex: `*.mp4`, `*.mkv`) |
| `-o, --output <dir>` | Diretório de saída para arquivos convertidos |
| `-r, --recursive` | Busca recursiva em subdiretórios (preserva estrutura) |
| `-m, --map-audio <faixas>` | Mapeia faixas de áudio específicas (separadas por vírgula, ex: `1,3,5`) |
| `-v, --version` | Mostra versão |
| `-h, --help` | Mostra ajuda |

### Central de Controle Interativa

```bash
rconv tui
```

A TUI inicia no diretório atual e oferece navegador de mídia, criação de pasta de saída, seleção de faixas de áudio, progresso, logs e cancelamento. Use as setas para navegar, `Enter` para selecionar, `P` para digitar um caminho e `N` para criar uma pasta com nome.

### Exemplos

```bash
# Converter um único arquivo
rconv -i video.mp4 -o ./saida

# Converter múltiplos arquivos com wildcard
rconv -i "*.mp4" -o ./convertidos

# Converter recursivamente em subdiretórios
rconv -r -i "*.mkv" -o ./saida

# Selecionar faixas de áudio específicas
rconv -i video.mp4 -o ./saida -m 1,3

# Usar brace expansion (sem aspas)
rconv -i *.{mp4,mkv,avi} -o ./saida
```

## Uso como Biblioteca

### Instalar como dependência

```bash
npm install @ltcode/rconv
# ou
bun add @ltcode/rconv
```

### API

```typescript
import { convertVideo, convertMultiple } from '@ltcode/rconv';

// Converter um único vídeo
const result = await convertVideo({
  input: 'video.mp4',
  output: './saida',
  audioTracks: [1, 3], // opcional
});

console.log(result.success); // true ou false

// Converter múltiplos vídeos
const results = await convertMultiple({
  input: '*.mp4',
  output: './convertidos',
  recursive: true, // opcional
  onProgress: (percent, file) => {
    console.log(`${file}: ${percent}%`);
  },
  onComplete: (file) => {
    console.log(`Concluído: ${file}`);
  },
  onError: (file, error) => {
    console.error(`Erro: ${file} - ${error.message}`);
  },
});

// Verificar se FFmpeg está disponível
import { checkFfmpeg } from '@ltcode/rconv';

if (!checkFfmpeg()) {
  console.error('FFmpeg não encontrado');
}
```

### Tipos

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

## Requisitos

- FFmpeg deve estar instalado e disponível no PATH

### Instalar FFmpeg

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

## Formatos Suportados

Qualquer formato suportado pelo FFmpeg pode ser usado como entrada. A saída é `.mov` com codec MPEG-4 e áudio PCM, amplamente compatível com DaVinci Resolve no Linux.

## Licença

MIT - Veja [LICENSE](LICENSE) para detalhes.

## Autor

Lucas Tiago - [GitHub](https://github.com/eulucastiagolt) - [Website](https://www.lucastiago.com.br)
