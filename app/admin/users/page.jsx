import {connectDB} from "@/lib/db";
import User from "@/lib/models/User";
import UserManager from "@/components/admin/UserManager";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminPage() {
  await connectDB();

  const users = await User.find()
    .sort({createdAt: -1})
    .lean();

  const pendingUsers = users.filter(
    (user) => user.status === "pending"
  );

  const approvedUsers = users.filter(
    (user) => user.status === "approved"
  );

  const serializedUsers = users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    access: user.access,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Users"
        description="Manage users and page access."
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mt-8">
          <UserManager users={serializedUsers} />
        </div>
      </div>
    </main>
  );
}

function Stat({label, value}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}