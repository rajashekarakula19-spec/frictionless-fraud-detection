#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if [ -x "$DIR/backend/.venv/bin/python" ]; then
    PYTHON_BIN="$DIR/backend/.venv/bin/python"
fi

echo "============================================================"
echo " Starting FraudSentinel: Real-Time Fraud Detection Engine   "
echo "============================================================"

# Ensure model artifact exists
if [ ! -f "$DIR/backend/models/fraud_model.pkl" ]; then
    echo ">> Training initial model artifact..."
    cd "$DIR/backend"
    PYTHONPATH=. "$PYTHON_BIN" src/models/trainer.py
fi

# Launch backend in background
echo ">> Launching FastAPI scoring server on http://127.0.0.1:8000 ..."
cd "$DIR/backend"
PYTHONPATH=. "$PYTHON_BIN" -m uvicorn src.api.server:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Launch frontend
echo ">> Launching Frontend UI on http://localhost:5173 ..."
cd "$DIR/frontend"
npm run dev -- --port 5173 &
FRONTEND_PID=$!

trap "echo 'Shutting down services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM

wait
