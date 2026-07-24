// File: frontend/src/components/layout/navConfig.ts

import {
  Banknote,
  CircleUser,
  CreditCard,
  LayoutDashboard,
  PlaneTakeoff,
  RotateCcw,
  Tag,
  Users2,
  Wallet,
} from "lucide-react";
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
    path: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "employee", "agent", "customer"],
  },
  {
    label: "الطلبات",
    path: "/dashboard/orders",
    icon: PlaneTakeoff,
    allowedRoles: ["admin", "employee", "agent", "customer"],
  },
  {
    label: "الوكلاء (B2B)",
    path: "/dashboard/agents",
    icon: Users2,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "المدفوعات",
    path: "/dashboard/payments",
    icon: CreditCard,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "المستردات",
    path: "/dashboard/refunds",
    icon: RotateCcw,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "الخدمات",
    path: "/dashboard/services",
    icon: Tag,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "العملات وسعر الصرف",
    path: "/dashboard/currencies",
    icon: Wallet,
    allowedRoles: ["admin"],
  },
  {
    label: "رسوم الحجز",
    path: "/dashboard/flight-booking-fee",
    icon: Banknote,
    allowedRoles: ["admin"],
  },
  {
    label: "حسابي",
    path: "/dashboard/profile",
    icon: CircleUser,
    allowedRoles: ["admin", "employee", "agent", "customer"],
  },
];
