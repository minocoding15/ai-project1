#!/usr/bin/env bash
set -euo pipefail

# Start script for the Coffee Shop project (backend + frontend)
# Location: backend/start/start.sh

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# BACKEND_DIR is the parent of this start/ folder
BACKEND_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
# REPO_ROOT is the parent of backend/
REPO_ROOT=$(cd "$BACKEND_DIR/.." && pwd)
FRONTEND_DIR="$REPO_ROOT/frontend"

HOST=${HOST:-10.0.1.80}
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}
VENV="$BACKEND_DIR/.venv"

echo "Project root: $REPO_ROOT"

# Load backend .env if present
if [ -f "$BACKEND_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$BACKEND_DIR/.env"
  set +a
fi

# Ensure venv exists and activate it
if [ -f "$VENV/bin/activate" ]; then
  # shellcheck disable=SC1090
  source "$VENV/bin/activate"
else
  echo "Creating virtualenv at $VENV..."
  python3 -m venv "$VENV"
  # shellcheck disable=SC1090
  source "$VENV/bin/activate"
  python -m pip install --upgrade pip setuptools wheel
  pip install -r "$BACKEND_DIR/requirements.txt"
fi

# Helper: check URL
check_url() {
  local url=$1
  if command -v curl >/dev/null 2>&1; then
    curl -s --max-time 2 "$url" >/dev/null 2>&1 && return 0 || return 1
  elif command -v wget >/dev/null 2>&1; then
    wget -q --timeout=2 --spider "$url" >/dev/null 2>&1 && return 0 || return 1
  else
    return 1
  fi
}

# Start backend if not already running
BACKEND_URL="http://$HOST:$BACKEND_PORT/health"
if check_url "$BACKEND_URL"; then
  echo "Backend already running at $HOST:$BACKEND_PORT"
else
  # seed DB if missing
  if [ ! -f "$BACKEND_DIR/backend.db" ]; then
    echo "Seeding database..."
    (cd "$REPO_ROOT" && python -m backend.seed)
  fi

  echo "Starting backend on $HOST:$BACKEND_PORT..."
  nohup python -m uvicorn backend.main:app --reload --host "$HOST" --port "$BACKEND_PORT" > "$BACKEND_DIR/backend.log" 2>&1 &
  sleep 1
  if check_url "$BACKEND_URL"; then
    echo "Backend started"
  else
    echo "Warning: backend did not respond yet; check $BACKEND_DIR/backend.log"
  fi
fi

# Start frontend if not already running
FRONTEND_URL="http://$HOST:$FRONTEND_PORT"
if check_url "$FRONTEND_URL"; then
  echo "Frontend already running at $HOST:$FRONTEND_PORT"
else
  echo "Starting frontend (Vite) on $HOST:$FRONTEND_PORT..."
  (cd "$FRONTEND_DIR" && nohup npm run dev > "$FRONTEND_DIR/frontend.log" 2>&1 &)
  sleep 1
  if check_url "$FRONTEND_URL"; then
    echo "Frontend started"
  else
    echo "Warning: frontend did not respond yet; check $FRONTEND_DIR/frontend.log"
  fi
fi

echo "Done. Frontend: http://$HOST:$FRONTEND_PORT  Backend: http://$HOST:$BACKEND_PORT"
