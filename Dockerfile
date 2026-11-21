# TailAdmin (NiceGUI) — production image
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install dependencies first (better layer caching) using the committed lockfile.
WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

# Copy dependency manifests, then sync the environment.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Copy the application source.
COPY main.py theme.py layout.py dashboard.py menu.py data.py ./

# Render supplies $PORT; default for local `docker run`.
ENV PORT=8080
EXPOSE 8080

# Put the virtualenv's bin on PATH so `python` resolves to the synced interpreter.
ENV PATH="/app/.venv/bin:$PATH"

# Drop privileges: the uv base image includes a non-root user.
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app
USER appuser

CMD ["python", "main.py"]