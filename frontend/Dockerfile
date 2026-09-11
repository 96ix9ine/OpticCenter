FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Этап 2: Раздача через Nginx ---
FROM nginx:stable-alpine
# Копируем собранный фронтенд в папку веб-сервера
COPY --from=builder /app/dist /usr/share/nginx/html
# Открываем стандартный порт контейнера
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]