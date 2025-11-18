# Стадия сборки
FROM node:18-alpine as build-stage

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Стадия продакшена
FROM nginx:alpine as production-stage

# Копируем собранное приложение
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Создаем non-root пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S vuejs -u 1001
RUN chown -R vuejs:nodejs /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

USER vuejs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]