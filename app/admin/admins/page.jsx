import {connectDB} from "@/lib/db";
import Admin from "@/lib/models/Admin";
import AdminManager from "@/components/admin/AdminManager";
import AdminHeader from "@/components/admin/AdminHeader";
import Link from "next/link";

export default async function AdminPage() {
  await connectDB();

  const admins = await Admin.find()
    .sort({createdAt: -1})
    .lean();

  const serializedAdmins = admins.map((admin) => ({
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    active: admin.active,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Admins"
        description="Manage admin accounts."
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mt-8">
          <AdminManager admins={serializedAdmins} />
        </div>
      </div>
    </main>
  );
}