# Snake Web Game (Go + JS)

Игра "Змейка" с backend на Go и web-интерфейсом на Canvas.

## Возможности

- Управление: экранные стрелки, `WASD`, клавиатурные стрелки и свайпы
- Выбор цветовой палитры змейки
- Проход сквозь стены с появлением с противоположной стороны поля
- Звуки движения, предупреждение при столкновении с собой и фоновая мелодия Бетховена
- Сложность: легкая / нормальная / сложная
- Текущий счет, лучший результат и топ-5 результатов
- Кнопки: старт, пауза, рестарт

## Локальный запуск

```bash
go run ./cmd/server
```

Откройте: `http://localhost:8080`

## Запуск в Docker

```bash
docker compose up --build
```

## Endpoint

- `GET /healthz` -> `ok`

## CI/CD

Workflow: `.github/workflows/ci-cd.yml`

- `test`: gofmt + go test
- `docker_publish`: публикация Docker image в DockerHub при push тега `v*`

Нужные GitHub Secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
