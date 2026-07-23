# File: scripts/agency_services_catalog.py

"""
كتالوج الخدمات الفعلي الذي تقدّمه وكالة براديس حالياً، كما ورد من
الوكالة نصاً. كل عنصر قاموس يمثّل صفاً واحداً في جدول services، مع
حقلي country/visa_type اختياريين لخدمات الفيزا/الإقامة فقط (تُنشئ صفاً
مرتبطاً في visa_residency_details).

لا تُدرَج هنا خدمتا "إقامة رومانيا الدائمة" و"إقامة بولندا الدائمة"
لأن الوكالة وصفتهما صراحةً بأنهما "قريباً" وليستا خدمة متاحة فعلياً بعد.
"""

from app.models.enums import ServiceCategory

AGENCY_SERVICES: list[dict] = [
    # قسم حجوزات التذاكر
    {"category": ServiceCategory.flight, "title": "تذاكر طيران"},
    {"category": ServiceCategory.ship_ticket, "title": "تذاكر بواخر"},
    # قسم التأشيرات
    {"category": ServiceCategory.visa, "title": "تأشيرة الإمارات", "country": "الإمارات", "visa_type": "زيارة سياحية"},
    {"category": ServiceCategory.visa, "title": "تأشيرة السعودية", "country": "السعودية", "visa_type": "سياحية، عُمرة بعد الحج"},
    {"category": ServiceCategory.visa, "title": "تأشيرة تركيا", "country": "تركيا", "visa_type": "دراسية، علاجية، سياحية"},
    {"category": ServiceCategory.visa, "title": "تأشيرة الهند", "country": "الهند", "visa_type": "علاجية، دراسية، بزنس"},
    {"category": ServiceCategory.visa, "title": "تأشيرة روسيا", "country": "روسيا", "visa_type": "دراسية، علاجية"},
    {"category": ServiceCategory.visa, "title": "تأشيرة مصر السياحية", "country": "مصر", "visa_type": "سياحية"},
    # قسم التأشيرات الإفريقية
    {"category": ServiceCategory.visa, "title": "تأشيرة إثيوبيا", "country": "إثيوبيا"},
    {"category": ServiceCategory.visa, "title": "تأشيرة جنوب السودان", "country": "جنوب السودان"},
    {"category": ServiceCategory.visa, "title": "تأشيرة كينيا", "country": "كينيا"},
    {"category": ServiceCategory.visa, "title": "تأشيرة رواندا", "country": "رواندا"},
    {"category": ServiceCategory.visa, "title": "تأشيرة يوغندا", "country": "يوغندا"},
    {"category": ServiceCategory.visa, "title": "تأشيرة تنزانيا", "country": "تنزانيا"},
    {"category": ServiceCategory.visa, "title": "تأشيرة نيجيريا", "country": "نيجيريا"},
    {"category": ServiceCategory.visa, "title": "تأشيرة موريتانيا", "country": "موريتانيا"},
    {"category": ServiceCategory.visa, "title": "تأشيرة الكاميرون", "country": "الكاميرون"},
    # قسم إقامات العمل
    {"category": ServiceCategory.residency, "title": "إقامة قطر", "country": "قطر"},
    {"category": ServiceCategory.residency, "title": "إقامة الإمارات", "country": "الإمارات", "visa_type": "سنة، سنتين"},
    {"category": ServiceCategory.residency, "title": "إقامة السعودية", "country": "السعودية", "visa_type": "3 شهور، سنة"},
    # قسم التجديد والتمديد
    {"category": ServiceCategory.renewal_extension, "title": "تجديد إقامة الكوارث في الإمارات"},
    {
        "category": ServiceCategory.renewal_extension,
        "title": "تمديد زيارة عائلية وشخصية وأعمال منتهية أو سارية في السعودية",
    },
    # قسم الموافقات الأمنية
    {"category": ServiceCategory.security_approval, "title": "موافقة أمنية لدخول مصر"},
    {"category": ServiceCategory.security_approval, "title": "موافقة أمنية لدخول ليبيا"},
    # قسم بكجات تخليص الإجراءات
    {"category": ServiceCategory.procedure_package, "title": "بكج تخليص إجراءات إقامة كمبالا"},
    {"category": ServiceCategory.procedure_package, "title": "بكج تخليص استقدام وزيارة عائلية أديس أبابا"},
    # قسم البكجات السياحية
    {"category": ServiceCategory.tourism_package, "title": "بكج سياحة جورجيا"},
    {"category": ServiceCategory.tourism_package, "title": "بكج سياحة إندونيسيا"},
    {"category": ServiceCategory.tourism_package, "title": "بكج سياحة أثيوبيا"},
    # قسم خدمات الاستخراج
    {"category": ServiceCategory.document_extraction, "title": "استخراج شرائح (زين، سوداني، MTN) بدل فاقد"},
    {"category": ServiceCategory.document_extraction, "title": "استخراج رخصة دولية"},
    {"category": ServiceCategory.document_extraction, "title": "استخراج قسائم زواج إلكترونية"},
    {"category": ServiceCategory.document_extraction, "title": "استخراج أرقام وطنية (بدل فاقد)"},
    {"category": ServiceCategory.document_extraction, "title": "استخراج شهادات جامعية"},
    {"category": ServiceCategory.document_extraction, "title": "استخراج شهادات ثانوية"},
    {"category": ServiceCategory.document_extraction, "title": "استخراج شهادات ميلاد (بدل فاقد)"},
    # قسم خدمات التوثيق
    {"category": ServiceCategory.attestation, "title": "توثيق وزارة الخارجية"},
    {"category": ServiceCategory.attestation, "title": "توثيق السجل المدني"},
    {"category": ServiceCategory.attestation, "title": "توثيق وزارة الداخلية"},
]
