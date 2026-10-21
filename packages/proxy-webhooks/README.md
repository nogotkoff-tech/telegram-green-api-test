# @gata/proxy-webhooks

Сервер-прокси для приема вебхуков от сервиса Green API и передачи уведомлений клиентам в режиме реального времени через Server-Sent Events (SSE).

---

## Архитектура и возможности

1. **Прием Webhooks от Green API:**
   - Эндпоинт: `POST /green-api/webhook` (также доступны алиасы `/green-api/webhook/`, `/webhook`).
   - Поддерживает как прямую отправку уведомления в теле запроса (`request.body`), так и формат с оберткой (`request.body.body` из `ReceiveNotificationAPIResponse`).
   - Валидирует уведомления входящих текстовых сообщений через схему `@gata/shared`: `IncomingTextMessageNotificationsFormatSchema`.
   - Поддерживает безопасный прием других типов уведомлений Green API (статусы доставки, системные уведомления).

2. **Server-Sent Events (SSE):**
   - Эндпоинты: `GET /green-api/events` или `GET /events` (также `/green-api/sse`, `/sse`).
   - Заголовки:
     - `Content-Type: text/event-stream`
     - `Cache-Control: no-cache, no-transform`
     - `Connection: keep-alive`
     - `X-Accel-Buffering: no` (отключает буферизацию Nginx)
     - `Access-Control-Allow-Origin: *` (CORS)
   - Поддержка фильтрации по инстансу через query-параметр: `GET /green-api/events?idInstance=1101820982`.
   - Автоматический heartbeat ping (`: ping\n\n`) каждые 25 секунд для предотвращения обрыва соединения прокси/NAT.
   - Корректное освобождение ресурсов при отключении клиента (`close`/`error`).

3. **Мониторинг:**
   - `GET /health` или `GET /green-api/health`: возвращает статус, аптайм и количество активных SSE-клиентов.
   - `GET /`: общая информация о сервисе.

---

## Пример подключения на клиенте (JavaScript / React)

```javascript
// Подключение к SSE-стриму с фильтрацией по вашему idInstance
const idInstance = "1101820982";
const eventSource = new EventSource(`http://your-server-ip/green-api/events?idInstance=${idInstance}`);

// Первичное рукопожатие
eventSource.addEventListener("connected", (event) => {
  console.log("SSE handshake:", JSON.parse(event.data));
});

// Получение входящих сообщений
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log("Incoming notification:", notification);

  if (notification.typeWebhook === "incomingMessageReceived") {
    const text = notification.messageData?.textMessageData?.textMessage;
    const sender = notification.senderData?.senderName;
    console.log(`Сообщение от ${sender}: ${text}`);
  }
};

eventSource.onerror = (error) => {
  console.error("SSE connection error:", error);
};
```

---

## Локальный запуск

```bash
# Режим разработки с автоперезагрузкой
npm run dev --workspace=@gata/proxy-webhooks

# Сборка бандла через tsup
npm run build --workspace=@gata/proxy-webhooks

# Запуск собранного сервера
npm run start --workspace=@gata/proxy-webhooks

# Запуск тестов
npm run test --workspace=@gata/proxy-webhooks
```

---

## Развертывание на VPS через Docker Compose

В корне проекта подготовлен `docker-compose.yml`, который поднимает:
1. `proxy-webhooks` — Node.js 22 контейнер (с многоэтапной сборкой и запуском от непривилегированного пользователя `node`).
2. `nginx` — обратный прокси-сервер с настроенной потоковой передачей SSE (`proxy_buffering off`, таймауты 24 часа).
3. `certbot` — контейнер для автоматического получения и продления SSL-сертификатов Let's Encrypt.

### Команды для запуска на VPS:

```bash
# 1. Запуск сервисов в фоновом режиме
docker compose up -d --build

# 2. Проверка статуса контейнеров
docker compose ps

# 3. Просмотр логов веб-сервера
docker compose logs -f proxy-webhooks

# 4. Проверка доступности через curl
curl http://localhost/health
```

### Настройка HTTPS (Let's Encrypt):

1. Получите SSL-сертификат:
   ```bash
   docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d yourdomain.com
   ```
2. Скопируйте настройки из `nginx/conf.d/ssl.conf.example` в `nginx/conf.d/default.conf` и укажите ваш домен.
3. Перезапустите Nginx:
   ```bash
   docker compose restart nginx
   ```
