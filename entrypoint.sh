#!/bin/sh
# يشغّل ترحيلات Alembic وسكربتات التهيئة الأساسية أولاً (كلها آمنة
# التكرار)، ثم يبدأ خادم Uvicorn.
set -e

alembic upgrade head
python -m scripts.seed_initial_data
python -m scripts.seed_agency_services
python -m scripts.seed_service_requirements
python -m scripts.seed_ship_routes
python -m scripts.set_launch_prices
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
