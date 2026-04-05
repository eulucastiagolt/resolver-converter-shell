# Resolver Converter

[![en](https://img.shields.io/badge/lang%20-%20en%20-%20%23651215?style=flat&logo=immersivetranslate&logoColor=%23ffffff&labelColor=%23F54B3E)](https://github.com/eulucastiagolt/resolver-converter-shell/blob/main/README.md)

Ferramenta de linha de comando para conversão de vídeos para o formato compatível com o DaVinci Resolve, projetada para resolver problemas de compatibilidade de vídeo ao usar o DaVinci Resolve em sistemas Linux.

## 📋 Requisitos

- Bash (GNU Bash 4.0 ou superior)
- FFmpeg (para conversão de vídeo)

## 🚀 Instalação

### Método 1: Instalação Rápida (Recomendado)

Execute o comando abaixo para instalar ou atualizar:

```bash
curl -sL https://raw.githubusercontent.com/eulucastiagolt/resolver-converter-shell/main/install.sh | bash
```

### Método 2: Instalação Manual

1. Baixe o script:

    ```bash
    curl -O https://raw.githubusercontent.com/eulucastiagolt/resolver-converter-shell/main/resolver-converter.sh
    chmod +x resolver-converter.sh
    ```

2. (Opcional) Instale globalmente:

    ```bash
    sudo mv resolver-converter.sh /usr/local/bin/resolver-converter
    ```

## 🛠 Como Usar

### Sintaxe Básica

```bash
resolver-converter -i ARQUIVO_ENTRADA -o DIRETORIO_SAIDA
```

### Opções

| Opção          | Descrição                                  |
| -------------- | ------------------------------------------ |
| `-i, --input`  | Arquivo de vídeo ou padrão (aceita wildcards como `*.mp4`, `*.{mp4,mkv}`) |
| `-o, --output` | Diretório de saída para o(s) vídeo(s) convertido(s) |
| `-r, --recursive` | Busca recursivamente em subdiretórios (preserva estrutura de diretórios) |
| `-m, --map-audio` | Mapeia faixas de áudio específicas (ex: `1,3,5`) |
| `-h, --help`   | Mostra a mensagem de ajuda                 |

### Exemplos de Uso

1. **Converter um único arquivo**:

   ```bash
   resolver-converter -i "meu video.mp4" -o ./saida
   ```

2. **Converter múltiplos arquivos com wildcard**:

   ```bash
   # Com aspas (o script expande internamente):
   resolver-converter -i "*.mp4" -o ./videos_convertidos
   
   # Sem aspas (o shell expande antes de passar ao script):
   resolver-converter -i *.mp4 -o ./videos_convertidos
   ```

3. **Converter múltiplos formatos com brace expansion**:

   ```bash
   # Brace expansion requer que o padrão seja passado SEM aspas:
   resolver-converter -i *.{mp4,mkv,avi} -o ./saida
   
   # Ou especifique múltiplos padrões:
   resolver-converter -i "*.mp4 *.mkv" -o ./saida
   ```

4. **Converter arquivos recursivamente em subdiretórios**:

   ```bash
   # Busca todos os arquivos .mkv no diretório atual e subdiretórios
   # Preserva a estrutura de diretórios na saída
   resolver-converter -r -i "*.mkv" -o ./saida
   
   # Exemplo: ./videos/subdir/video.mkv -> ./saida/videos/subdir/video.mov
   ```

5. **Selecionar faixas de áudio específicas**:

   ```bash
   resolver-converter -i video.mp4 -o ./saida -m 1,3
   ```

   Este comando irá incluir apenas as faixas de áudio 1 e 3 no arquivo de saída.

4. **Arquivos com espaços no nome**:

   ```bash
   resolver-converter -i "meu video com espacos.mkv" -o ./saida
   ```

5. **Arquivos com múltiplos pontos no nome**:

   ```bash
   resolver-converter -i "video.2023.10.18.final.mp4" -o ./saida
   ```

   Será convertido para: `video.2023.10.18.final.mov`

### Características

- Suporte a múltiplos formatos de vídeo de entrada
- Preserva nomes de arquivo complexos com múltiplos pontos
- Tratamento adequado de espaços em nomes de arquivo
- Cria automaticamente o diretório de saída se não existir
- Feedback detalhado durante o processo de conversão
- Suporte a seleção de faixas de áudio específicas
- Verificação automática de dependências (FFmpeg)
- Instalação global simplificada

### Exemplos

1. Converter um único arquivo:

    ```bash
    # Se instalado globalmente:
    resolver-converter -i video.mp4 -o ./saida

    # Se estiver usando localmente:
    ./resolver-converter.sh -i video.mp4 -o ./saida
    ```

2. Converter todos os arquivos de um diretório:

    ```bash
    # Converter todos os arquivos .mp4 do diretório:
    resolver-converter -i *.mp4 -o ./saida

    # Especificar múltiplos arquivos:
    resolver-converter -i "video1.mp4 video2.mp4 video3.mp4" -o ./saida

    # Usar curinga em subdiretórios:
    resolver-converter -i "./**/*.mp4" -o ./saida
    ```

3. Usar caminhos absolutos:

    ```bash
    resolver-converter --input /caminho/do/video.avi --output /caminho/da/saida
    ```

## 🔄 Formatos Suportados

O script usa o FFmpeg para conversão, então qualquer formato de vídeo suportado pelo FFmpeg pode ser usado como entrada. A saída será no formato `.mov` com codec MPEG-4 e áudio PCM, que é amplamente compatível com o DaVinci Resolve.

## ❓ Ajuda

Para ver todas as opções disponíveis:

```bash
resolver-converter --help
```

## 📝 Notas

- O script criará automaticamente o diretório de saída se ele não existir.
- Se ocorrer algum erro durante a conversão, uma mensagem será exibida indicando o problema.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por [Lucas Tiago](https://github.com/eulucastiagolt) | [www.lucastiago.com.br](https://www.lucastiago.com.br)
