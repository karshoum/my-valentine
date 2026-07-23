# File: app/main.py

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import AppException, logger
from app.routers import (
    agents,
    audit,
    auth,
    currencies,
    files,
    flight_bookings,
    leads,
    orders,
    payments,
    refunds,
    services,
    users,
)

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.APP_NAME,
    description="منصة رقمية متكاملة لوكالة سفر وسياحة وخدمات أعمال (B2C & B2B)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """يضيف ترويسات أمان قياسية لكل استجابة (FastAPI لا يضيفها افتراضياً)."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """يحوّل أي AppException إلى استجابة JSON برسالة عربية، ويسجّل التفاصيل التقنية في اللوجز فقط."""
    if exc.technical_detail:
        logger.error("AppException @ %s: %s", request.url.path, exc.technical_detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message_ar})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """يلتقط أي خطأ غير متوقع، يسجّل تتبّعه الكامل في اللوجز، ويعيد رسالة عربية عامة للعميل."""
    logger.exception("خطأ غير متوقع في %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني"},
    )


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(agents.router)
app.include_router(currencies.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(flight_bookings.router)
app.include_router(payments.router)
app.include_router(refunds.router)
app.include_router(leads.router)
app.include_router(audit.router)
app.include_router(files.router)


@app.get("/", tags=["الحالة"])
def health_check() -> dict[str, str]:
    """فحص صحة بسيط للتأكد من أن الخدمة تعمل."""
    return {"status": "ok", "app": settings.APP_NAME}
