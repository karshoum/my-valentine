#!/bin/sh
# يشغّل ترحيلات Alembic وسكربتات التهيئة الأساسية أولاً (كلها آمنة
# التكرار)، ثم يبدأ خادم Uvicorn.
set -e

alembic upgrade head
python -m scripts.seed_initial_data
python -m scripts.seed_agency_services
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
