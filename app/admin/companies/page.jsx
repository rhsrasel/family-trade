import {connectDB} from "@/lib/db";
import Company from "@/lib/models/Company";
import Product from "@/lib/models/Product";
import CompanyManager from "@/components/admin/CompanyManager";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminCompaniesPage() {
  await connectDB();

  const companies = await Company.find()
    .sort({createdAt: -1})
    .lean();

  const products = await Product.find()
    .select("company")
    .lean();

  const productCounts = {};

  for (const product of products) {
    productCounts[product.company] =
      (productCounts[product.company] || 0) + 1;
  }

  const serializedCompanies = companies.map((company) => ({
    id: company._id.toString(),
    name: company.name,
    productsCount: productCounts[company.name] || 0,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Companies"
        description="Manage companies."
      />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <CompanyManager
          initialCompanies={serializedCompanies}
        />
      </div>
    </main>
  );
}