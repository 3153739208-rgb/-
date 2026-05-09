@echo off
chcp 65001 >nul
title 校园闲置交易平台

echo ========================================
echo   校园闲置交易平台 - 一键启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 启动后端服务 (localhost:3001)...
start "校园平台-后端" cmd /c "cd server && npx nodemon src/index.js"

echo [2/2] 启动前端服务 (localhost:5173)...
start "校园平台-前端" cmd /c "cd client && npx vite --host"

echo.
echo ========================================
echo   启动完成！
echo   前端: http://localhost:5173
echo   后端: http://localhost:3001
echo   管理员: admin@campus.com / admin123
echo ========================================
echo.
echo 按任意键退出此窗口（不影响服务运行）
pause >nul
