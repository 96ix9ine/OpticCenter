FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем пакеты
RUN npm install

# Копируем остальной код
COPY . .

# Открываем порт Vite
EXPOSE 5173

# Запускаем в режиме разработки с флагом --host
CMD ["npm", "run", "dev", "--", "--host"]