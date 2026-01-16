"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileClientProps = {
  email: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  phone: string;
};

const tabs = ["Personal Data", "Security", "Notifications"] as const;

type TabKey = (typeof tabs)[number];
type NotificationPrefs = {
  email: boolean;
  transactions: boolean;
  security: boolean;
  marketing: boolean;
};

export default function ProfileClient({ email, createdAt, firstName, lastName, phone }: ProfileClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("Personal Data");
  const [profileFirstName, setProfileFirstName] = useState(firstName);
  const [profileLastName, setProfileLastName] = useState(lastName);
  const [profilePhone, setProfilePhone] = useState(phone);
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [profileError, setProfileError] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    email: true,
    transactions: true,
    security: true,
    marketing: false,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");
  const notificationOptions: { key: keyof NotificationPrefs; title: string; description: string }[] = [
    {
      key: "email",
      title: "Email Notifications",
      description: "Receive notifications about new deposits and activity via email",
    },
    {
      key: "transactions",
      title: "Transaction Notifications",
      description: "Receive notifications about all transactions on your account",
    },
    {
      key: "security",
      title: "Security Notifications",
      description: "Receive notifications about account logins and security settings changes",
    },
    {
      key: "marketing",
      title: "Marketing Notifications",
      description: "Receive information about new protocols, features, and special offers",
    },
  ];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("lkNotificationPrefs");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        setNotificationPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore invalid storage.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("lkNotificationPrefs", JSON.stringify(notificationPrefs));
    } catch {
      // ignore
    }
  }, [notificationPrefs]);

  const handleSaveNotifications = () => {
    setSavingNotifications(true);
    setTimeout(() => {
      setSavingNotifications(false);
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 1500);
    }, 300);
  };

  const handleProfileSave = async () => {
    setProfileStatus("saving");
    setProfileError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileFirstName,
          lastName: profileLastName,
          phone: profilePhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setProfileStatus("error");
        setProfileError(data?.error || "Could not save profile.");
        return;
      }
      setProfileStatus("success");
      router.refresh();
      setTimeout(() => setProfileStatus("idle"), 1500);
    } catch {
      setProfileStatus("error");
      setProfileError("Network error. Try again.");
    }
  };

  const handlePasswordChange = async () => {
    setPasswordStatus("saving");
    setPasswordError("");
    try {
      const res = await fetch("/api/auth/change-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setPasswordStatus("error");
        const derivedError =
          (typeof data?.error === "string" && data.error) ||
          data?.error?.formErrors?.join(" ") ||
          data?.error?.fieldErrors?.currentPassword?.[0] ||
          data?.error?.fieldErrors?.confirmNewPassword?.[0] ||
          data?.error?.fieldErrors?.newPassword?.[0] ||
          data?.error?.message ||
          "Could not start password change.";
        setPasswordError(derivedError);
        return;
      }
      setPasswordStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      setPasswordStatus("error");
      setPasswordError("Network error. Try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-semibold">
            {firstName ? firstName[0] : "U"}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Account"}
            </div>
            <div className="text-sm text-gray-500">Account created: {createdAt}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap gap-6 border-b border-gray-100 pb-4 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-3 transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-700 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Personal Data" ? (
          <>
            {profileStatus === "error" ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </div>
            ) : null}
            {profileStatus === "success" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Profile updated.
              </div>
            ) : null}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">First Name</span>
                <input
                  className="h-11 rounded-xl border border-gray-200 px-3"
                  value={profileFirstName}
                  onChange={(e) => setProfileFirstName(e.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Last Name</span>
                <input
                  className="h-11 rounded-xl border border-gray-200 px-3"
                  value={profileLastName}
                  onChange={(e) => setProfileLastName(e.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Email</span>
                <input
                  className="h-11 rounded-xl border border-gray-200 px-3"
                  defaultValue={email}
                  disabled
                />
              </label>
              <label className="grid gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Phone</span>
                <input
                  className="h-11 rounded-xl border border-gray-200 px-3"
                  placeholder="+1 (555) 000-0000"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-6">
              <button
                className="h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white disabled:opacity-60"
                type="button"
                onClick={handleProfileSave}
                disabled={profileStatus === "saving"}
              >
                {profileStatus === "saving" ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        ) : null}

        {activeTab === "Security" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {passwordStatus === "error" ? (
              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {passwordError}
              </div>
            ) : null}
            {passwordStatus === "success" ? (
              <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                A confirmation link was sent to your email. Finish the change from your inbox.
              </div>
            ) : null}
            <label className="grid gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Current password</span>
              <input
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <div className="grid gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">New password</span>
              <input
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Repeat new password</span>
              <input
                className="h-11 rounded-xl border border-gray-200 px-3"
                type="password"
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 text-sm text-gray-500">
              We will send a secure link to your email to finalize the password change, similar to the registration flow.
            </div>
            <div className="md:col-span-2">
              <button
                className="h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white disabled:opacity-60"
                onClick={handlePasswordChange}
                disabled={passwordStatus === "saving"}
                type="button"
              >
                {passwordStatus === "saving" ? "Sending link..." : "Send password change link"}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "Notifications" ? (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {notificationOptions.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                >
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <div className="flex w-16 items-center justify-end">
                    <button
                      type="button"
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                        notificationPrefs[item.key] ? "bg-blue-600" : "bg-gray-300"
                      }`}
                      onClick={() =>
                        setNotificationPrefs((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      aria-pressed={notificationPrefs[item.key]}
                      aria-label={`Toggle ${item.title}`}
                    >
                      <span
                        className={`h-6 w-6 rounded-full bg-white shadow transition ${
                          notificationPrefs[item.key] ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white disabled:opacity-60"
                type="button"
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
              >
                {savingNotifications ? "Saving..." : "Save Settings"}
              </button>
              {notifSaved ? <span className="text-sm text-emerald-600">Saved</span> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
