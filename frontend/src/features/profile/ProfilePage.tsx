// File: frontend/src/features/profile/ProfilePage.tsx

import { CircleUser } from "lucide-react";

import { useAuth } from "@/features/auth/useAuth";
import { AgentProfileCard } from "@/features/profile/AgentProfileCard";
import { ChangePasswordForm } from "@/features/profile/ChangePasswordForm";
import { useCurrentUserProfile } from "@/features/profile/useCurrentUserProfile";
import { useMyAgentProfile } from "@/features/profile/useMyAgentProfile";
import { roleLabels } from "@/lib/roleLabels";

/** شاشة الحساب الشخصي: البيانات الأساسية، ملف الوكالة (لو agent)، وتغيير كلمة المرور. */
export function ProfilePage() {
  const { role } = useAuth();
  const { profile, isLoading, error } = useCurrentUserProfile();
  const { agentProfile, isLoading: isLoadingAgentProfile } = useMyAgentProfile(role === "agent");

  if (isLoading) {
    return <p className="text-sm text-slate-500">جارٍ تحميل بيانات الحساب...</p>;
  }

  if (error || !profile) {
    return (
      <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error ?? "تعذّر جلب بيانات الحساب"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">حسابي</h1>
        <p className="text-sm text-slate-500">بياناتك الشخصية وإعدادات الحساب</p>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CircleUser size={24} />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{profile.full_name}</p>
            <p className="text-xs text-slate-500">{roleLabels[profile.role]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">البريد الإلكتروني</p>
            <p className="mt-0.5 font-medium text-slate-800">{profile.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">رقم الهاتف</p>
            <p className="mt-0.5 font-medium text-slate-800">{profile.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">تاريخ الانضمام</p>
            <p className="mt-0.5 font-medium text-slate-800">
              {new Date(profile.created_at).toLocaleDateString("ar")}
            </p>
          </div>
        </div>
      </div>

      {role === "agent" && !isLoadingAgentProfile && agentProfile && (
        <AgentProfileCard agentProfile={agentProfile} />
      )}

      <ChangePasswordForm />
    </div>
  );
}
