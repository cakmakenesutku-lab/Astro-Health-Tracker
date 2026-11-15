@echo off
chcp 65001 >nul
title AstroHealth Tracker
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8

py -3 --version >nul 2>nul
if %errorlevel%==0 (
  py -3 server\sunucu.py
  goto son
)
python --version >nul 2>nul
if %errorlevel%==0 (
  python server\sunucu.py
  goto son
)
echo.
echo  Python bulunamadi.
echo  https://www.python.org/downloads/ adresinden Python 3 kurun.
echo  Kurulumda "Add python.exe to PATH" kutusunu isaretleyin.
echo.
:son
pause
