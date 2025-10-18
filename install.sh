#!/bin/bash
# ===============================================
# INSTALADOR DO RESOLVER CONVERTER
# ===============================================
# Por Lucas Tiago - www.lucastiago.com.br

# URL do script no GitHub
SCRIPT_URL="https://raw.githubusercontent.com/eulucastiagolt/resolver-converter-shell/main/resolver-converter.sh"

# Nome do comando
COMMAND_NAME="resolver-converter"

# Diretório de instalação
INSTALL_DIR="/usr/local/bin"

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o script está sendo executado como root
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}Aviso: Não execute este script como root.${NC}"
    exit 1
fi

echo -e "${GREEN}=== Instalador do Resolver Converter ===${NC}"

# Verificar dependências
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}Atenção: FFmpeg não encontrado. É necessário instalar o FFmpeg para o funcionamento do script.${NC}"
    echo "Você pode instalá-lo com os seguintes comandos:"
    echo "  Debian/Ubuntu: sudo apt install ffmpeg"
    echo "  Fedora: sudo dnf install ffmpeg"
    echo "  Arch Linux: sudo pacman -S ffmpeg"
    echo -e "${YELLOW}Instale o FFmpeg e execute este script novamente.${NC}"
    exit 1
fi

# Verificar se o diretório de instalação existe
if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Criando diretório de instalação...${NC}"
    sudo mkdir -p "$INSTALL_DIR" || {
        echo -e "${YELLOW}Erro: Não foi possível criar o diretório de instalação.${NC}" >&2
        exit 1
    }
fi

# Baixar o script
echo -e "${GREEN}Baixando o script...${NC}"
if command -v curl >/dev/null 2>&1; then
    sudo curl -sL "$SCRIPT_URL" -o "$INSTALL_DIR/$COMMAND_NAME"
elif command -v wget >/dev/null 2>&1; then
    sudo wget -qO "$INSTALL_DIR/$COMMAND_NAME" "$SCRIPT_URL"
else
    echo -e "${YELLOW}Erro: É necessário ter curl ou wget instalado.${NC}" >&2
    exit 1
fi

# Verificar se o download foi bem-sucedido
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Erro: Falha ao baixar o script.${NC}" >&2
    exit 1
fi

# Tornar o script executável
sudo chmod +x "$INSTALL_DIR/$COMMAND_NAME"

# Verificar se a instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Instalação concluída com sucesso!${NC}"
    echo -e "O comando '${YELLOW}$COMMAND_NAME${NC}' está disponível globalmente."
    echo -e "\n${GREEN}Como usar:${NC}"
    echo "  $COMMAND_NAME -i arquivo_entrada -o diretorio_saida"
    echo -e "\nPara ver todas as opções:"
    echo -e "  ${YELLOW}$COMMAND_NAME --help${NC}"
else
    echo -e "${YELLOW}Erro: Falha ao instalar o script.${NC}" >&2
    exit 1
fi
