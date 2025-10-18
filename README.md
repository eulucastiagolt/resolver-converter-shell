# Resolver Converter

Ferramenta de linha de comando para conversão de vídeos para o formato compatível com o DaVinci Resolve.

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
| `-i, --input`  | Arquivo de vídeo de entrada                |
| `-o, --output` | Diretório de saída para o vídeo convertido |
| `-h, --help`   | Mostra a mensagem de ajuda                 |

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
    resolver-converter -i "*.mp4" -o ./saida

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
