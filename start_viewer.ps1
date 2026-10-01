Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AWS RoboMaker Small Warehouse 3D Visualizer Launcher  " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Opening http://localhost:8089/index_legacy.html in your browser..." -ForegroundColor Yellow
Write-Host "For Vite + React + R3F: run 'npm run dev' or '.\start_vite.bat'" -ForegroundColor Gray

Start-Process "http://localhost:8089/index_legacy.html"
python -m http.server 8089
