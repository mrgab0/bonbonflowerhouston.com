#!/usr/bin/env bash
echo "==================================================================="
echo "    BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143III POS"
echo "==================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v python3 &>/dev/null; then
    echo "Iniciando con Python 3..."
    python3 "$SCRIPT_DIR/star-pos-daemon.py"
elif command -v node &>/dev/null; then
    echo "Iniciando con Node.js..."
    node "$SCRIPT_DIR/star-pos-daemon.js"
else
    echo "[ERROR] No se encontró Python 3 ni Node.js en este equipo."
    exit 1
fi
