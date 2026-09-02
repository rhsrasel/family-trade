import Link from "next/link";
import {notFound} from "next/navigation";
import {connectDB} from "@/lib/db";
import Company from "@/lib/models/Company";
import Product from "@/lib/models/Product";
import AdminHeader from "@/components/admin/AdminHeader";
import CompanyDetails from "@/components/admin/CompanyDetails";

export default async function AdminCompanyPage({params}) {
  const {id} = await params;

  await connectDB();

  const company = await Company.findById(id).lean();

  if (!company) {
    notFound();
  }

  const products = await Product.find({
    company: company.name,
  })
    .sort({createdAt: -1})
    .lean();

  const serializedProducts = products.map((product) => ({
    id: product._id.toString(),
    title: product.title,
    stock: product.stock,
    dp: product.dp,
    tp: product.tp,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title={company.name}
        description="Manage company and products."
      />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <CompanyDetails
          company={{
            id: company._id.toString(),
            name: company.name,
          }}
          initialProducts={serializedProducts}
        />
      </div>
    </main>
  );
}