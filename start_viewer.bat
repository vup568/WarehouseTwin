@echo off
title AWS RoboMaker Warehouse 3D Visualizer
echo ========================================================
echo   AWS RoboMaker Small Warehouse 3D Visualizer Launcher
echo ========================================================
echo Starting local web server on port 8089...
echo.
echo [1] Standalone 3D Viewer: http://localhost:8089/index_legacy.html
echo [2] For React + R3F Digital Twin: run start_vite.bat
echo.

start "" "http://localhost:8089/index_legacy.html"
python -m http.server 8089

pause
