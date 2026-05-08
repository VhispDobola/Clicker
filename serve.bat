@echo off
echo Starting Quantum Genesis...
cd /d "%~dp0"
python -m http.server 8080
pause