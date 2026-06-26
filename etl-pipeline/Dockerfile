FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user and change ownership
RUN addgroup --system appuser && adduser --system --group appuser && chown -R appuser:appuser /app

USER appuser

COPY --chown=appuser:appuser . .

CMD ["python", "scheduler.py"]
