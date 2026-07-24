// File: frontend/src/features/profile/ProfilePage.tsx

import { CircleUser } from "lucide-react";
import { useState } from "react";

import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useAuth } from "@/features/auth/useAuth";
import { AgentProfileCard } from "@/features/profile/AgentProfileCard";
import { ChangePasswordForm } from "@/features/profile/ChangePasswordForm";
import { DeactivateAccountSection } from "@/features/profile/DeactivateAccountSection";
import { EditProfileForm } from "@/features/profile/EditProfileForm";
import { useCurrentUserProfile } from "@/features/profile/useCurrentUserProfile";
import { useMyAgentProfile } from "@/features/profile/useMyAgentProfile";
import { roleLabels } from "@/lib/roleLabels";
import type { UserOut } from "@/types/user";

/** شاشة الحساب الشخصي: البيانات الأساسية، تعديلها، ملف الوكالة (لو agent)، تغيير كلمة المرور، وإيقاف الحساب. */
export function ProfilePage() {
  const { role } = useAuth();
  const { profile: fetchedProfile, isLoading, error } = useCurrentUserProfile();
  const { agentProfile, isLoading: isLoadingAgentProfile } = useMyAgentProfile(role === "agent");
  const [profile, setProfile] = useState<UserOut | null>(null);

  const currentProfile = profile ?? fetchedProfile;

  if (isLoading) {
    return <LoadingIndicator label="جارٍ تحميل بيانات الحساب..." />;
  }

  if (error || !currentProfile) {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-500/10 text-navy-600">
            <CircleUser size={24} />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{currentProfile.full_name}</p>
            <p className="text-xs text-slate-500">{roleLabels[currentProfile.role]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">البريد الإلكتروني</p>
            <p className="mt-0.5 font-medium text-slate-800">{currentProfile.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">رقم الهاتف</p>
            <p className="mt-0.5 font-medium text-slate-800">{currentProfile.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">رقم واتساب</p>
            <p className="mt-0.5 font-medium text-slate-800">{currentProfile.whatsapp_number ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">تاريخ الانضمام</p>
            <p className="mt-0.5 font-medium text-slate-800">
              {new Date(currentProfile.created_at).toLocaleDateString("ar")}
            </p>
          </div>
        </div>
      </div>

      <EditProfileForm profile={currentProfile} onUpdated={setProfile} />

      {role === "agent" && !isLoadingAgentProfile && agentProfile && (
        <AgentProfileCard agentProfile={agentProfile} />
      )}

      <ChangePasswordForm />

      <DeactivateAccountSection />
    </div>
  );
}
