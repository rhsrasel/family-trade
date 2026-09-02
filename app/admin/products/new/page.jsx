import {connectDB} from "@/lib/db";
import Company from "@/lib/models/Company";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductCreate from "@/components/admin/ProductCreate";

export default async function AdminProductCreatePage() {
  await connectDB();

  const companies = await Company.find()
    .sort({name: 1})
    .lean();

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Create Product"
        description="Add a new product."
      />

      <div className="mx-auto max-w-3xl px-6 py-6">
        <ProductCreate
          companies={companies.map(
            (company) => ({
              id: company._id.toString(),
              name: company.name,
            })
          )}
        />
      </div>
    </main>
  );
}