"use client";

import { useState } from "react";

type ProfileClientProps = {
  email: string;
  createdAt: string;
  firstName: string;
  lastName: string;
};

const tabs = ["Personal Data", "Security", "Notifications"] as const;

type TabKey = (typeof tabs)[number];

export default function ProfileClient({ email, createdAt, firstName, lastName }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Personal Data");

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
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">First Name</span>
              <input
                className="h-11 rounded-xl border border-gray-200 px-3"
                defaultValue={firstName}
              />
            </label>
            <label className="grid gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Last Name</span>
              <input
                className="h-11 rounded-xl border border-gray-200 px-3"
                defaultValue={lastName}
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
              <input className="h-11 rounded-xl border border-gray-200 px-3" placeholder="+1 (555) 000-0000" />
            </label>
          </div>
        ) : (
          <div className="mt-6 text-sm text-gray-500">
            This section will be available soon.
          </div>
        )}

        <div className="mt-6">
          <button className="h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
