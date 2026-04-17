import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Profile | SpawnDrive",
  description: "Manage car listings, model QA, and publication workflow.",
};

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_38%,_#eef2ff_100%)]">
        <AdminDashboard />
      </main>
    </>
  );
}
