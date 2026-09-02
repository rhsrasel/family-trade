import {notFound} from "next/navigation";
import {connectDB} from "@/lib/db";
import Product from "@/lib/models/Product";
import Company from "@/lib/models/Company";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductDetails from "@/components/admin/ProductDetails";

export default async function AdminProductPage({params}) {
  const {id} = await params;

  await connectDB();

  const product = await Product.findById(id).lean();

  if (!product) {
    notFound();
  }

  const companies = await Company.find()
    .sort({name: 1})
    .lean();

  const serializedProduct = {
    id: product._id.toString(),
    title: product.title,
    stock: product.stock,
    dp: product.dp,
    tp: product.tp,
    company: product.company,
    orderHistory: (product.orderHistory || []).map(
      (order) => ({
        id: order._id.toString(),
        quantity: order.quantity,
        type: order.type,
        note: order.note,
        date: order.date.toISOString(),
      })
    ),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title={product.title}
        description="Manage product."
      />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <ProductDetails
          initialProduct={serializedProduct}
          initialCompanies={companies.map(
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