@echo off
chcp 65001 >nul
title AstroHealth Tracker (cevrimdisi)
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8
set ASTRO_CEVRIMDISI=1
echo  Cevrimdisi mod: internet kullanilmaz, yalnizca data\yedek verileri gosterilir.
py -3 --version >nul 2>nul
if %errorlevel%==0 (
  py -3 server\sunucu.py
  goto son
)
python server\sunucu.py
:son
pause
