# Etapa de build
FROM node:20-slim AS builder

WORKDIR /app

# Copia os arquivos principais do monorepo
COPY package*.json ./            
COPY yarn.lock ./                
COPY tsconfig*.json ./           
COPY packages/api/package.json packages/api/ 
COPY packages/services/package.json packages/services/ 
COPY packages/utilities/package.json packages/utilities/ 
COPY packages/services/prisma ./packages/services/prisma  

# Instala todas as dependências no monorepo
RUN yarn install

# Copia todos os arquivos do monorepo
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate --schema=./packages/services/prisma/schema.prisma

# Faz o build do monorepo
RUN npm run build

# Etapa final de produção
FROM node:20-slim

WORKDIR /app

# Instala o OpenSSL correto e dependências adicionais
RUN apt-get update && apt-get install -y openssl chromium ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdrm2 libgbm1 libgtk-3-0 libnss3 libxss1 libxtst6 xdg-utils && rm -rf /var/lib/apt/lists/*

# Copia apenas os arquivos necessários para produção
COPY package*.json ./            
COPY yarn.lock ./                
COPY packages/api/package.json packages/api/ 
COPY packages/services/package.json packages/services/ 
COPY packages/utilities/package.json packages/utilities/ 

# Instala apenas dependências de produção
RUN yarn install --production

# Copia o build gerado, o Prisma Client e o esquema
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/services/dist ./packages/services/dist
COPY --from=builder /app/packages/utilities/dist ./packages/utilities/dist
COPY --from=builder /app/packages/services/prisma ./packages/services/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma


# Configurações de runtime
EXPOSE 3001

CMD ["node", "packages/api/dist/index.js"]
