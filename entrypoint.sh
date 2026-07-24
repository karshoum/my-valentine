#!/bin/sh
# يشغّل ترحيلات Alembic أولاً (آمن التكرار)، ثم يبدأ خادم Uvicorn.
set -e

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
