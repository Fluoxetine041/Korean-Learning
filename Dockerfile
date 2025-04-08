FROM node:20-alpine

WORKDIR /app

# 複製依賴檔案
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製源代碼
COPY . .

# 生成Prisma客戶端
RUN npm run prisma:generate

# 構建應用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 設置環境變數
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 啟動應用
CMD ["node", ".output/server/index.mjs"] 