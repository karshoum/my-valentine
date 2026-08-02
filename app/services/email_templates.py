# File: app/services/email_templates.py

"""
قالب HTML موحّد لكل إيميلات المنصة، يعكس الهوية البصرية الرسمية
(كحلي/ذهبي على خلفية كريمية) وشعار الوكالة، مع تحميل الشعار مرة واحدة
فقط ومشاركته بين كل الرسائل المُرسَلة.
"""

from functools import lru_cache
from pathlib import Path

_LOGO_PATH = Path(__file__).resolve().parent.parent / "assets" / "logo.png"
LOGO_CONTENT_ID = "agency-logo"


@lru_cache(maxsize=1)
def load_logo_bytes() -> bytes | None:
    """يقرأ ملف شعار الوكالة من القرص مرة واحدة ويخزّنه في الذاكرة، أو يُعيد None إذا لم يوجد."""
    if not _LOGO_PATH.exists():
        return None
    return _LOGO_PATH.read_bytes()


def render_html_email(heading: str, paragraphs: list[str]) -> str:
    """
    يبني نص HTML لإيميل واحد بالهوية البصرية الموحّدة للوكالة.

    Args:
        heading: عنوان الرسالة الظاهر أعلى المحتوى.
        paragraphs: فقرات النص، كل واحدة تُعرض في سطر مستقل.

    Returns:
        str: نص HTML كامل جاهز للإرسال كجزء بديل (alternative) عن النسخة النصية.
    """
    paragraphs_html = "".join(f'<p style="margin:0 0 12px;line-height:1.8;color:#1f2937;">{p}</p>' for p in paragraphs)

    return f"""
    <div style="background:#f4f2e5;padding:32px 16px;font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;
        border:1px solid #ece5d3;">
        <div style="background:#22364e;padding:20px;text-align:center;">
          <img src="cid:{LOGO_CONTENT_ID}" alt="وكالة برادايس" style="height:56px;border-radius:8px;" />
        </div>
        <div style="padding:24px;">
          <h2 style="color:#22364e;margin:0 0 16px;font-size:18px;">{heading}</h2>
          {paragraphs_html}
        </div>
        <div style="background:#96723d;color:#ffffff;text-align:center;padding:10px;font-size:12px;">
          وكالة برادايس — PARADISE Travel &amp; Tourism
        </div>
      </div>
    </div>
    """
