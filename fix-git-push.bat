@echo off
echo Running fix-git-push.ps1 with ExecutionPolicy Bypass...
powershell -ExecutionPolicy Bypass -File "%~dp0fix-git-push.ps1"
pause