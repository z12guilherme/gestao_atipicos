# Estágio 1: Build da aplicação React
FROM node:18-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package.json ./
COPY package-lock.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte da aplicação
COPY . .

# Executa o script de build para gerar os arquivos estáticos
RUN npm run build

# Estágio 2: Servidor de produção com Nginx
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no estágio de build para o diretório padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80 para acesso externo
EXPOSE 80

# O comando padrão do Nginx (`nginx -g 'daemon off;'`) será executado quando o container iniciar