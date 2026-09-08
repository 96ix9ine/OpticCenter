# --- ЭТАП 1: СБОРКА ЗАВИСИМОСТЕЙ ---
FROM python:3.10-slim AS builder

WORKDIR /app

# Устанавливаем инструменты компиляции, необходимые для сборки некоторых библиотек
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Обновляем pip и устанавливаем зависимости через корректное зеркало ВШЭ
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --user --upgrade pip && \
    pip install --user -r requirements.txt


# --- ЭТАП 2: ФИНАЛЬНЫЙ ЛЕГКИЙ ОБРАЗ ДЛЯ ЗАПУСКА ---
FROM python:3.10-slim AS runner

WORKDIR /app

# Копируем только установленные пакеты из первого этапа
COPY --from=builder /root/.local /root/.local
COPY . .

# Добавляем путь к установленным пакетам в переменные окружения
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
