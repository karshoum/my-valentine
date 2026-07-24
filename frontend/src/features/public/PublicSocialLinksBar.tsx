// File: frontend/src/features/public/PublicSocialLinksBar.tsx

import { Globe, Link2, MessageCircle, Send, Video } from "lucide-react";

import { usePublicSocialLinks } from "@/features/socialLinks/usePublicSocialLinks";

/**
 * lucide-react لا يوفّر أيقونات شعارات الشركات (فيسبوك/إنستغرام/...)
 * لأسباب تتعلق بالعلامات التجارية، لذا تُستخدم أيقونات عامة معبّرة
 * (رسالة/تشغيل فيديو/رابط) بدل شعار كل منصة تحديداً.
 */
const PLATFORM_ICON_MATCHERS: { keywords: string[]; icon: typeof Link2 }[] = [
  { keywords: ["واتساب", "whatsapp"], icon: MessageCircle },
  { keywords: ["تيليجرام", "تلجرام", "telegram"], icon: Send },
  { keywords: ["يوتيوب", "youtube", "تيك توك", "tiktok"], icon: Video },
  { keywords: ["فيسبوك", "facebook", "إنستغرام", "انستقرام", "instagram", "تويتر", "twitter"], icon: Globe },
];

/** يختار أيقونة مناسبة حسب اسم المنصة (نصياً)، أو أيقونة رابط عامة إن لم تُعرف. */
function iconForPlatform(platformName: string): typeof Link2 {
  const normalized = platformName.trim().toLowerCase();
  const match = PLATFORM_ICON_MATCHERS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return match?.icon ?? Link2;
}

/** شريط روابط التواصل الاجتماعي المُفعَّلة، يظهر لكل زوّار الصفحة العامة. */
export function PublicSocialLinksBar() {
  const { links, isLoading } = usePublicSocialLinks();

  if (isLoading || links.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/30 bg-white/40 px-4 py-3 backdrop-blur-sm">
      {links.map((link) => {
        const Icon = iconForPlatform(link.platform_name);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.platform_name}
            className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5
              text-xs font-medium text-slate-600 transition-colors hover:bg-navy-50 hover:text-navy-700"
          >
            <Icon size={14} />
            {link.platform_name}
          </a>
        );
      })}
    </div>
  );
}
