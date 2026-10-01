@echo off
title AWS RoboMaker Warehouse Digital Twin (Vite + R3F)
echo ====================================================================
echo   AWS Warehouse Digital Twin (React + Three.js + R3F)
echo ====================================================================
echo Checking node_modules...
if not exist node_modules (
  echo Installing dependencies, please wait...
  call npm install
)

echo Starting Vite Dev Server...
call npm run dev
pause
