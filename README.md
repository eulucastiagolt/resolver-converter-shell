# Resolver Converter

Ferramenta de linha de comando para conversão de vídeos para o formato compatível com o DaVinci Resolve.

## 📋 Requisitos

- Bash (GNU Bash 4.0 ou superior)
- FFmpeg (para conversão de vídeo)

## 🚀 Instalação

### Linux

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/resolver-converter.git
   cd resolver-converter
   ```

2. Torne o script executável:
   ```bash
   chmod +x resolver-converter.sh
   ```

3. (Opcional) Mova para um diretório no PATH para uso global:
   ```bash
   sudo mv resolver-converter.sh /usr/local/bin/resolver-converter
   ```

## 🛠 Como Usar

### Sintaxe Básica
```bash
./resolver-converter.sh -i ARQUIVO_ENTRADA -o DIRETORIO_SAIDA
```

### Opções
| Opção          | Descrição                                  |
|----------------|-------------------------------------------|
| `-i, --input`  | Arquivo de vídeo de entrada               |
| `-o, --output` | Diretório de saída para o vídeo convertido|
| `-h, --help`   | Mostra a mensagem de ajuda                |

### Exemplos

1. Converter um único arquivo:
   ```bash
   ./resolver-converter.sh -i video.mp4 -o ./saida
   ```

2. Usar caminhos absolutos:
   ```bash
   ./resolver-converter.sh --input /caminho/do/video.avi --output /caminho/da/saida
   ```

3. Se instalado globalmente:
   ```bash
   resolver-converter -i entrada.mkv -o ./videos_convertidos
   ```

## 🔄 Formatos Suportados

O script usa o FFmpeg para conversão, então qualquer formato de vídeo suportado pelo FFmpeg pode ser usado como entrada. A saída será no formato `.mov` com codec MPEG-4 e áudio PCM, que é amplamente compatível com o DaVinci Resolve.

## ❓ Ajuda

Para ver todas as opções disponíveis:
```bash
./resolver-converter.sh --help
```

## 📝 Notas

- O script criará automaticamente o diretório de saída se ele não existir.
- Se ocorrer algum erro durante a conversão, uma mensagem será exibida indicando o problema.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por [Seu Nome](https://github.com/seu-usuario) | [www.seusite.com](https://www.seusite.com)
