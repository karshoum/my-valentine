// File: frontend/src/lib/serviceCategoryIcons.tsx

import {
  Anchor,
  Award,
  Building2,
  FileSearch,
  Package,
  Palmtree,
  Plane,
  RefreshCw,
  Rocket,
  ShieldCheck,
  ShieldPlus,
  Stamp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ServiceCategory } from "@/types/enums";

/** أيقونة تمثيلية عصرية لكل تصنيف خدمة، تُستخدم في الخلفيات المزخرفة وبطاقات الخدمة. */
export const serviceCategoryIcons: Record<ServiceCategory, LucideIcon> = {
  flight: Plane,
  ship_ticket: Anchor,
  visa: Stamp,
  residency: Building2,
  insurance: ShieldPlus,
  renewal_extension: RefreshCw,
  security_approval: ShieldCheck,
  procedure_package: Package,
  tourism_package: Palmtree,
  document_extraction: FileSearch,
  attestation: Award,
};

/** تصنيفات الرحلات/التنقّل التي يظهر خلفها خط مسار منقّط في الخلفية المزخرفة. */
export const JOURNEY_CATEGORIES: ServiceCategory[] = ["flight", "ship_ticket", "tourism_package"];

/** أيقونة قسم "قريباً" (خدمات مستقبلية) — ليس تصنيف خدمة حقيقياً بالخلفية. */
export const comingSoonIcon: LucideIcon = Rocket;
