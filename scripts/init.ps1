# 校园宝 (Campus Treasure) - Windows 初始化脚本
# 运行方式: PowerShell -ExecutionPolicy Bypass -File scripts\init.ps1

Write-Host "========================================" -ForegroundColor Blue
Write-Host "   校园宝 (Campus Treasure) 初始化     " -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 检查配置文件
$ConfigFile = ".agent\config.secure.json"
if (-not (Test-Path $ConfigFile)) {
    Write-Host "错误: 找不到配置文件 $ConfigFile" -ForegroundColor Red
    exit 1
}

# 读取配置
$Config = Get-Content $ConfigFile | ConvertFrom-Json
$GitUser = $Config.git_config.user_name
$GitEmail = $Config.git_config.user_email

Write-Host "✓ 配置文件读取成功" -ForegroundColor Green

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Blue
try {
    $NodeVersion = node -v
    Write-Host "✓ Node.js $NodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "Node.js 未安装,请先安装 Node.js 20+" -ForegroundColor Yellow
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 pnpm
Write-Host "检查 pnpm..." -ForegroundColor Blue
try {
    $PnpmVersion = pnpm -v
    Write-Host "✓ pnpm $PnpmVersion" -ForegroundColor Green
}
catch {
    Write-Host "pnpm 未安装,正在安装..." -ForegroundColor Yellow
    npm install -g pnpm
    $PnpmVersion = pnpm -v
    Write-Host "✓ pnpm $PnpmVersion" -ForegroundColor Green
}

# 检查 Docker
Write-Host "检查 Docker..." -ForegroundColor Blue
try {
    $DockerVersion = docker --version
    Write-Host "✓ $DockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "Docker 未安装,请安装 Docker Desktop" -ForegroundColor Yellow
    Write-Host "下载地址: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
}

# 配置 Git
Write-Host "配置 Git..." -ForegroundColor Blue
git config user.name $GitUser
git config user.email $GitEmail
Write-Host "✓ Git 用户: $GitUser <$GitEmail>" -ForegroundColor Green

# 检查 Expo CLI
Write-Host "检查 Expo CLI..." -ForegroundColor Blue
try {
    expo --version | Out-Null
    Write-Host "✓ Expo CLI 已安装" -ForegroundColor Green
}
catch {
    Write-Host "Expo CLI 未安装,正在安装..." -ForegroundColor Yellow
    pnpm add -g expo-cli eas-cli
    Write-Host "✓ Expo CLI 安装完成" -ForegroundColor Green
}

# 安装项目依赖
if (Test-Path "package.json") {
    Write-Host "安装项目依赖..." -ForegroundColor Blue
    pnpm install
    Write-Host "✓ 依赖安装完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   初始化完成!                         " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor White
Write-Host "  1. 运行 pnpm dev:backend 启动后端" -ForegroundColor Yellow
Write-Host "  2. 运行 pnpm dev:mobile 启动移动端" -ForegroundColor Yellow
Write-Host "  3. 运行 docker-compose up -d 启动数据库" -ForegroundColor Yellow
