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

## Развертывание на VPS

Если на вашем сервере уже есть главный Nginx (например, в `/opt/andrey-nogotkov.ru`), в текущем проекте запускается только контейнер `proxy-webhooks`:

```bash
docker compose up -d --build
```

Сервер начинает слушать порт `127.0.0.1:3000` на хосте.

### Подключение к Nginx (`telegram-green-api-test.nogotech.online`):

В папку конфигураций Nginx вашего основного проекта (например, `/opt/andrey-nogotkov.ru/nginx/conf.d/`) скопируйте файл `nginx/conf.d/telegram-green-api-test.nogotech.online.conf`.

#### Обратите внимание на директиву `upstream`:
* Если Nginx на VPS запущен в режиме `network_mode: host` — оставьте `server 127.0.0.1:3000;`.
* Если Nginx в Docker bridge сети:
  * Можно использовать IP адрес Docker-шлюза хоста: `server 172.17.0.1:3000;` (или `host.docker.internal:3000`).
  * Либо подключить оба проекта к одной общей Docker-сети и проксировать напрямую: `server gata-proxy-webhooks:3000;`.

### Получение SSL-сертификата Certbot для поддомена:
```bash
# Выполните на сервере через ваш существующий certbot контейнер:
docker compose exec certbot certonly --webroot -w /var/www/certbot -d telegram-green-api-test.nogotech.online

# Перезагрузите конфигурацию Nginx:
docker compose exec nginx nginx -s reload
```
