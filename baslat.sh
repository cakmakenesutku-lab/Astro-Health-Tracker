#!/bin/sh
# macOS / Linux için başlatıcı
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then python3 server/sunucu.py
elif command -v python >/dev/null 2>&1; then python server/sunucu.py
else echo "Python 3 bulunamadı: https://www.python.org/downloads/"; fi
