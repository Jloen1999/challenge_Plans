@echo off
echo Limpiando node_modules y reinstalando dependencias...
cd /d "C:\Users\JLOel\Desktop\OPT8-Frameworks\practica2\challenge_Plans\frontend"
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install --legacy-peer-deps
echo Dependencias reinstaladas correctamente.
pause
