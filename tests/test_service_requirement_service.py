# File: tests/test_service_requirement_service.py

"""اختبارات إضافة/تعديل/حذف بنود متطلبات الخدمة، وسلامة كتالوج متطلبات الوكالة."""

import pytest

from app.core.exceptions import AppException
from app.schemas.service_requirement import ServiceRequirementCreateRequest, ServiceRequirementUpdateRequest
from app.services import service_requirement_service
from scripts.agency_services_catalog import AGENCY_SERVICES
from scripts.service_requirements_catalog import SERVICE_REQUIREMENTS


def test_add_requirement_attaches_to_service(db_session, sample_service, admin_user):
    payload = ServiceRequirementCreateRequest(requirement_text="صورة جواز السفر ساري المفعول.", display_order=0)

    requirement = service_requirement_service.add_requirement(db_session, sample_service.id, payload, admin_user)

    db_session.refresh(sample_service)
    assert requirement.service_id == sample_service.id
    assert len(sample_service.requirements) == 1
    assert sample_service.requirements[0].requirement_text == payload.requirement_text


def test_add_requirement_for_missing_service_raises_404(db_session, admin_user):
    payload = ServiceRequirementCreateRequest(requirement_text="بند تجريبي")

    with pytest.raises(AppException) as exc_info:
        service_requirement_service.add_requirement(db_session, 999_999, payload, admin_user)
    assert exc_info.value.status_code == 404


def test_update_requirement_changes_text_and_order(db_session, sample_service, admin_user):
    requirement = service_requirement_service.add_requirement(
        db_session, sample_service.id, ServiceRequirementCreateRequest(requirement_text="نص أصلي"), admin_user
    )

    updated = service_requirement_service.update_requirement(
        db_session,
        requirement.id,
        ServiceRequirementUpdateRequest(requirement_text="نص مُعدَّل", display_order=5),
        admin_user,
    )

    assert updated.requirement_text == "نص مُعدَّل"
    assert updated.display_order == 5


def test_delete_requirement_removes_it(db_session, sample_service, admin_user):
    requirement = service_requirement_service.add_requirement(
        db_session, sample_service.id, ServiceRequirementCreateRequest(requirement_text="بند للحذف"), admin_user
    )

    service_requirement_service.delete_requirement(db_session, requirement.id, admin_user)

    with pytest.raises(AppException) as exc_info:
        service_requirement_service.get_requirement_or_404(db_session, requirement.id)
    assert exc_info.value.status_code == 404


def test_deleting_service_cascades_to_its_requirements(db_session, sample_service, admin_user):
    from app.services import service_service

    requirement = service_requirement_service.add_requirement(
        db_session, sample_service.id, ServiceRequirementCreateRequest(requirement_text="بند"), admin_user
    )
    requirement_id = requirement.id

    service_service.delete_service(db_session, sample_service.id, admin_user)

    with pytest.raises(AppException):
        service_requirement_service.get_requirement_or_404(db_session, requirement_id)


def test_every_catalog_service_has_requirements_mapped():
    catalog_titles = {entry["title"] for entry in AGENCY_SERVICES}
    assert catalog_titles == set(SERVICE_REQUIREMENTS.keys())


def test_no_requirement_list_is_empty():
    for title, requirement_texts in SERVICE_REQUIREMENTS.items():
        assert len(requirement_texts) > 0, f"الخدمة '{title}' بلا بنود متطلبات"
