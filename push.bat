@echo off
"c:\linked list\secure-chat\bin\git.exe" init
"c:\linked list\secure-chat\bin\git.exe" add .
"c:\linked list\secure-chat\bin\git.exe" commit -m "Initial commit: Secure Chat with E2E encryption and deployment configs"
"c:\linked list\secure-chat\bin\git.exe" branch -M main
"c:\linked list\secure-chat\bin\git.exe" remote add origin https://github.com/VanshikaChaudhary12/Secure-Chat.git
"c:\linked list\secure-chat\bin\git.exe" push -u origin main --force
