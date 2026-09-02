import AdminHeader from "@/components/admin/AdminHeader";
import ProductManager from "@/components/admin/ProductManager";

import {connectDB} from "@/lib/db";

import Product from "@/lib/models/Product";
import Company from "@/lib/models/Company";

export default async function ProductsPage() {
  await connectDB();

  const products = await Product.find()
    .sort({createdAt: -1})
    .lean();

  const companies = await Company.find()
    .sort({name: 1})
    .lean();

  const serializedProducts = products.map(
    (product) => ({
      id: product._id.toString(),
      title: product.title,
      stock: product.stock,
      dp: product.dp,
      tp: product.tp,
      company: product.company,
      orderHistory:
        product.orderHistory?.map((order) => ({
          id: order._id.toString(),
          quantity: order.quantity,
          type: order.type,
          note: order.note,
          date: order.date,
        })) || [],
    })
  );

  const serializedCompanies = companies.map(
    (company) => ({
      id: company._id.toString(),
      name: company.name,
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Products"
        description="Manage products and stock."
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <ProductManager
          initialProducts={serializedProducts}
          companies={serializedCompanies}
        />
      </main>
    </div>
  );
}