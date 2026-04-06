#!/bin/bash
# ===============================================
# INSTALADOR DO RESOLVER CONVERTER (LEGACY)
# ===============================================
# Por Lucas Tiago - www.lucastiago.com.br
#
# NOTE: This installs the legacy shell script version.
# For the modern TypeScript/npm version, run:
#   npm install -g @ltcode/rconv
#   OR
#   bun install -g @ltcode/rconv

LEGACY_DIR="$(dirname "$0")/legacy"
LEGACY_INSTALL="$LEGACY_DIR/install.sh"

if [ -f "$LEGACY_INSTALL" ]; then
  bash "$LEGACY_INSTALL"
else
  echo "Error: Legacy installer not found at $LEGACY_INSTALL"
  echo ""
  echo "Try installing via npm/bun instead:"
  echo "  npm install -g @ltcode/rconv"
  echo "  bun install -g @ltcode/rconv"
  exit 1
fi