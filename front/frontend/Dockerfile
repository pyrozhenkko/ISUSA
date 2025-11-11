FROM node:20-alpine

# Робоча папка
WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо решту коду
COPY . .

# Відкриваємо порт Vite (5173)
EXPOSE 5173

# Запускаємо Vite-сервер
CMD ["npm", "run", "dev"]
