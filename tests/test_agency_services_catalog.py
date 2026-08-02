# File: tests/test_agency_services_catalog.py

"""اختبارات كتالوج خدمات الوكالة وسكربت زرعه (idempotency وسلامة البيانات)."""

from app.models.enums import ServiceCategory
from app.models.service import Service, VisaResidencyDetail
from scripts.agency_services_catalog import AGENCY_SERVICES
from scripts.seed_agency_services import _create_service_if_missing


def test_catalog_titles_are_unique():
    titles = [entry["title"] for entry in AGENCY_SERVICES]
    assert len(titles) == len(set(titles))


def test_catalog_categories_are_valid_enum_members():
    for entry in AGENCY_SERVICES:
        assert isinstance(entry["category"], ServiceCategory)


def test_create_service_if_missing_inserts_once(db_session):
    entry = {"category": ServiceCategory.flight, "title": "تذاكر طيران تجريبية"}

    first_result = _create_service_if_missing(db_session, entry)
    db_session.commit()
    second_result = _create_service_if_missing(db_session, entry)

    assert first_result is not None
    assert second_result is None
    assert db_session.query(Service).filter(Service.title == entry["title"]).count() == 1


def test_visa_entry_creates_residency_detail_with_country(db_session):
    entry = {
        "category": ServiceCategory.visa,
        "title": "تأشيرة تجريبية",
        "country": "دولة تجريبية",
        "visa_type": "نوع تجريبي",
    }

    service = _create_service_if_missing(db_session, entry)
    db_session.commit()

    detail = db_session.query(VisaResidencyDetail).filter(VisaResidencyDetail.service_id == service.id).first()
    assert detail is not None
    assert detail.country == "دولة تجريبية"
    assert detail.type == "نوع تجريبي"


def test_non_visa_entry_creates_no_residency_detail(db_session):
    entry = {"category": ServiceCategory.attestation, "title": "خدمة توثيق تجريبية"}

    service = _create_service_if_missing(db_session, entry)
    db_session.commit()

    detail = db_session.query(VisaResidencyDetail).filter(VisaResidencyDetail.service_id == service.id).first()
    assert detail is None
