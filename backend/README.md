# Семейный банкинг — бэкенд (Go)

MVP-функция: перевод карманных денег от родителя к ребёнку.
Данные хранятся in-memory, база данных (PostgreSQL) — на следующем этапе.

## Запуск

```bash
cd backend
go run .
```

Сервер слушает `http://localhost:8080`.
Требуется Go 1.22+ (используются только возможности стандартной библиотеки — `net/http`, `sync`, `encoding/json`; сторонние зависимости не нужны).

## Эндпоинты

| Метод | Путь                     | Описание                                                                 |
|-------|--------------------------|--------------------------------------------------------------------------|
| GET   | `/api/family/state`      | Текущее состояние семьи: баланс родителя, баланс ребёнка, список задач.  |
| POST  | `/api/family/transfer`   | Перевод денег родитель → ребёнок. Тело: `{ "amount": 10 }`.              |

### Ответ `GET /api/family/state`

```json
{
  "parentBalance": 100,
  "childBalance": 20,
  "tasks": ["Собрать портфель к школе", "Помыть посуду после ужина"]
}
```

### Пример `POST /api/family/transfer`

```bash
curl -X POST http://localhost:8080/api/family/transfer \
  -H "Content-Type: application/json" \
  -d '{"amount": 10}'
```

```json
{
  "parentBalance": 90,
  "childBalance": 30,
  "message": "Перевод выполнен успешно"
}
```

Ошибки возвращаются в формате `{ "error": "..." }` со статусом:

- `400` — сумма ≤ 0 или некорректный JSON;
- `422` — недостаточно средств у родителя.

## CORS

Сервер разрешает запросы только с `http://localhost:5173` (Vite dev-сервер фронтенда), включая preflight `OPTIONS` для POST с `Content-Type: application/json`.

## Структура

- `main.go` — весь сервер: in-memory сервис (`familyService`), обработчики, CORS-middleware, роутер.