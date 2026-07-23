# File: tests/test_storage.py

"""اختبارات تحصين رفع الملفات: allowlist لنوع المحتوى وحد أقصى للحجم."""

from io import BytesIO

import pytest
from starlette.datastructures import Headers, UploadFile

from app.core import storage
from app.core.exceptions import AppException


def _make_upload(content: bytes, content_type: str, filename: str = "file.bin") -> UploadFile:
    return UploadFile(file=BytesIO(content), filename=filename, headers=Headers({"content-type": content_type}))


def test_save_private_file_rejects_disallowed_content_type(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "PRIVATE_ROOT", tmp_path)
    upload = _make_upload(b"<script>alert(1)</script>", "text/html", "evil.html")

    with pytest.raises(AppException) as exc_info:
        storage.save_private_file(upload, "payment_receipts")
    assert exc_info.value.status_code == 400


def test_save_private_file_rejects_oversized_file(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "PRIVATE_ROOT", tmp_path)
    oversized_content = b"x" * (storage.MAX_UPLOAD_SIZE_BYTES + 1)
    upload = _make_upload(oversized_content, "image/png", "big.png")

    with pytest.raises(AppException) as exc_info:
        storage.save_private_file(upload, "payment_receipts")
    assert exc_info.value.status_code == 400


def test_save_private_file_accepts_allowed_image(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "PRIVATE_ROOT", tmp_path)
    upload = _make_upload(b"\x89PNG fake content", "image/png", "receipt.png")

    stored_path = storage.save_private_file(upload, "payment_receipts")

    assert stored_path.startswith("payment_receipts/")
    assert stored_path.endswith(".png")
    assert (tmp_path / stored_path).is_file()
