#!/bin/bash
# 校园宝 (Campus Treasure) - Linux 初始化脚本
# 运行方式: chmod +x scripts/init.sh && ./scripts/init.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   校园宝 (Campus Treasure) 初始化     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查配置文件
CONFIG_FILE=".agent/config.secure.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}错误: 找不到配置文件 $CONFIG_FILE${NC}"
    exit 1
fi

# 检查 jq
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}jq 未安装,正在安装...${NC}"
    SUDO_PASS=$(cat "$CONFIG_FILE" | grep -o '"sudo_password": "[^"]*' | cut -d'"' -f4)
    echo "$SUDO_PASS" | sudo -S apt-get update
    echo "$SUDO_PASS" | sudo -S apt-get install -y jq
fi

# 读取配置
SUDO_PASS=$(jq -r '.ubuntu_config.sudo_password' "$CONFIG_FILE")
GIT_USER=$(jq -r '.git_config.user_name' "$CONFIG_FILE")
GIT_EMAIL=$(jq -r '.git_config.user_email' "$CONFIG_FILE")

echo -e "${GREEN}✓ 配置文件读取成功${NC}"

# 检查 Node.js
echo -e "${BLUE}检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js 未安装,请先安装 Node.js 20+${NC}"
    echo "推荐使用 nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# 检查 pnpm
echo -e "${BLUE}检查 pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm 未安装,正在安装...${NC}"
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}✓ pnpm ${PNPM_VERSION}${NC}"

# 检查 Docker
echo -e "${BLUE}检查 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker 未安装,正在安装...${NC}"
    echo "$SUDO_PASS" | sudo -S apt-get update
    echo "$SUDO_PASS" | sudo -S apt-get install -y docker.io docker-compose
    echo "$SUDO_PASS" | sudo -S usermod -aG docker $USER
    echo -e "${YELLOW}请重新登录以使 Docker 权限生效${NC}"
fi
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ ${DOCKER_VERSION}${NC}"
fi

# 配置 Git
echo -e "${BLUE}配置 Git...${NC}"
git config user.name "$GIT_USER"
git config user.email "$GIT_EMAIL"
echo -e "${GREEN}✓ Git 用户: $GIT_USER <$GIT_EMAIL>${NC}"

# 检查 Expo CLI
echo -e "${BLUE}检查 Expo CLI...${NC}"
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}Expo CLI 未安装,正在安装...${NC}"
    pnpm add -g expo-cli eas-cli
fi
if command -v expo &> /dev/null; then
    echo -e "${GREEN}✓ Expo CLI 已安装${NC}"
fi

# 安装项目依赖
if [ -f "package.json" ]; then
    echo -e "${BLUE}安装项目依赖...${NC}"
    pnpm install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   初始化完成!                         ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "下一步:"
echo -e "  1. 运行 ${YELLOW}pnpm dev:backend${NC} 启动后端"
echo -e "  2. 运行 ${YELLOW}pnpm dev:mobile${NC} 启动移动端"
echo -e "  3. 运行 ${YELLOW}docker-compose up -d${NC} 启动数据库"
