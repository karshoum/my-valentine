// File: frontend/src/features/users/UsersPage.tsx

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { CreateAgentModal } from "@/features/agents/CreateAgentModal";
import { CreateStaffModal } from "@/features/users/CreateStaffModal";
import { useUpdateUserStatus } from "@/features/users/useUpdateUserStatus";
import { useUsers } from "@/features/users/useUsers";
import { inputBaseClass } from "@/lib/designTokens";
import { roleLabels } from "@/lib/roleLabels";
import type { UserRole } from "@/types/enums";
import type { UserOut } from "@/types/user";

const ROLE_FILTERS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "customer", label: "عملاء" },
  { value: "agent", label: "وكلاء" },
  { value: "employee", label: "موظفون" },
  { value: "admin", label: "مديرون" },
];

/**
 * شاشة "المستخدمون" (admin فقط): قائمة موحّدة لكل الحسابات (عملاء،
 * وكلاء، موظفون، مديرون) مع تصفية حسب الدور وبحث بالاسم/الهاتف، وزرّا
 * إنشاء في نفس المكان: "+ إضافة موظف" و"+ إضافة وكيل".
 */
export function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const { users, isLoading, error, refetch } = useUsers(roleFilter === "all" ? null : roleFilter);
  const { updateStatus, isSubmitting: isUpdatingStatus } = useUpdateUserStatus();

  const [searchText, setSearchText] = useState("");
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserOut | null>(null);

  const filteredUsers = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    if (!search) return users;
    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(search) ||
        (user.phone ?? "").includes(search) ||
        (user.email ?? "").toLowerCase().includes(search),
    );
  }, [users, searchText]);

  const handleConfirmToggle = async () => {
    if (!userToToggle) return;
    const updated = await updateStatus(userToToggle.id, !userToToggle.is_active);
    if (updated) {
      setUserToToggle(null);
      refetch();
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="جارٍ تحميل المستخدمين..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">المستخدمون</h1>
          <p className="text-sm text-slate-500">قائمة موحّدة لكل الحسابات — عملاء ووكلاء وموظفون ومديرون</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsCreateStaffOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold
              text-white transition-all duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98]"
          >
            <Plus size={16} />
            إضافة موظف
          </button>
          <button
            type="button"
            onClick={() => setIsCreateAgentOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold
              text-white transition-all duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98]"
          >
            <Plus size={16} />
            إضافة وكيل
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ROLE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setRoleFilter(filter.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              roleFilter === filter.value
                ? "bg-navy-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="ابحث بالاسم أو الهاتف أو البريد..."
          className={`w-full pe-9 ${inputBaseClass}`}
        />
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
              <th className="px-3 py-2.5 text-start">الاسم</th>
              <th className="px-3 py-2.5 text-start">الهاتف</th>
              <th className="px-3 py-2.5 text-start">البريد الإلكتروني</th>
              <th className="px-3 py-2.5 text-start">الدور</th>
              <th className="px-3 py-2.5 text-start">الحالة</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-3 py-2.5 font-medium text-slate-900">{user.full_name}</td>
                <td className="px-3 py-2.5 text-slate-600">{user.phone ?? "—"}</td>
                <td className="px-3 py-2.5 text-slate-600">{user.email ?? "—"}</td>
                <td className="px-3 py-2.5 text-slate-600">{roleLabels[user.role]}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user.is_active ? "مفعَّل" : "موقوف"}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-end">
                  <button
                    type="button"
                    onClick={() => setUserToToggle(user)}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                  >
                    {user.is_active ? "إيقاف" : "تفعيل"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                  لا يوجد مستخدمون مطابقون
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreateStaffOpen && (
        <CreateStaffModal
          onClose={() => setIsCreateStaffOpen(false)}
          onCreated={() => {
            setIsCreateStaffOpen(false);
            refetch();
          }}
        />
      )}

      {isCreateAgentOpen && (
        <CreateAgentModal
          onClose={() => setIsCreateAgentOpen(false)}
          onCreated={() => {
            setIsCreateAgentOpen(false);
            refetch();
          }}
        />
      )}

      {userToToggle && (
        <ConfirmDialog
          title={userToToggle.is_active ? "إيقاف حساب مستخدم" : "تفعيل حساب مستخدم"}
          message={
            userToToggle.is_active
              ? `هل أنت متأكد من إيقاف حساب "${userToToggle.full_name}"؟ لن يتمكّن من تسجيل الدخول حتى إعادة تفعيله.`
              : `هل تريد إعادة تفعيل حساب "${userToToggle.full_name}"؟`
          }
          confirmLabel={userToToggle.is_active ? "إيقاف" : "تفعيل"}
          isConfirming={isUpdatingStatus}
          onConfirm={handleConfirmToggle}
          onCancel={() => setUserToToggle(null)}
        />
      )}
    </div>
  );
}
