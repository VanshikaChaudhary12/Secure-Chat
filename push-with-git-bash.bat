@echo off
echo Pushing to GitHub...
echo.

cd /d "c:\linked list\secure-chat"

set PATH=%PATH%;c:\linked list\secure-chat\bin

git init
git add .
git commit -m "Initial commit: Secure Chat with E2E encryption and deployment configs"
git branch -M main
git remote add origin https://github.com/VanshikaChaudhary12/Secure-Chat.git
git push -u origin main --force

echo.
echo Done! Code pushed to GitHub.
pause
