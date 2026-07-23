// File: frontend/src/components/layout/navConfig.ts

import { CircleUser, CreditCard, LayoutDashboard, PlaneTakeoff, Tag, Users2, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { UserRole } from "@/types/enums";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
}

/** عناصر التنقل الجانبي، مفلترة حسب دور المستخدم الحالي عند العرض. */
export const navItems: NavItem[] = [
  {
    label: "لوحة التحكم",
    path: "/",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "employee", "agent", "customer"],
  },
  {
    label: "الطلبات",
    path: "/orders",
    icon: PlaneTakeoff,
    allowedRoles: ["admin", "employee", "agent", "customer"],
  },
  {
    label: "الوكلاء (B2B)",
    path: "/agents",
    icon: Users2,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "المدفوعات",
    path: "/payments",
    icon: CreditCard,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "الخدمات",
    path: "/services",
    icon: Tag,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "العملات وسعر الصرف",
    path: "/currencies",
    icon: Wallet,
    allowedRoles: ["admin"],
  },
  {
    label: "حسابي",
    path: "/profile",
    icon: CircleUser,
    allowedRoles: ["admin", "employee", "agent", "customer"],
  },
];
