#!/bin/bash
echo "VITE_API_BASE_URL=https://api.xinyuex.com.cn/api" > .env.production
cat .env.production
echo "--- 开始构建 ---"
npm run build
echo "--- 复制到 Nginx 目录 ---"
mkdir -p /var/www/queue
cp -r dist/* /var/www/queue/
echo "--- 部署完成 ---"
