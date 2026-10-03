import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import Ledger from "@/lib/models/Ledger";
import Company from "@/lib/models/Company";
import Market from "@/lib/models/Market";
import Product from "@/lib/models/Product";
import AdminHeader from "@/components/admin/AdminHeader";
import UserHeader from "@/components/user/UserHeader";
import LedgerTable from "@/components/ledger/LedgerTable";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const adminToken = cookieStore.get("admin_token")?.value;

  if (adminToken) {
    try {
      const { payload } = await jwtVerify(adminToken, secret);

      return {
        ...payload,
        role: "admin",
      };
    } catch {
      // Continue and check user token.
    }
  }

  const userToken = cookieStore.get("user_token")?.value;

  if (userToken) {
    try {
      const { payload } = await jwtVerify(userToken, secret);

      return {
        ...payload,
        role: "user",
      };
    } catch {
      // Not authenticated.
    }
  }

  return null;
}

export default async function LedgerPage({ params }) {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    redirect("/admin/login");
  }

  const { id } = await params;

  await connectDB();

  const [ledger, companies, markets, products] = await Promise.all([
    Ledger.findById(id).lean(),

    Company.find()
      .sort({
        name: 1,
      })
      .lean(),

    Market.find()
      .sort({
        name: 1,
      })
      .lean(),

    Product.find()
      .sort({
        title: 1,
      })
      .lean(),
  ]);

  if (!ledger) {
    redirect("/ledger");
  }

  const serializedCompanies = companies.map((company) => ({
    id: company._id.toString(),
    name: company.name,
  }));

  const serializedMarkets = markets.map((market) => ({
    id: market._id.toString(),
    name: market.name,
    address: market.address,
  }));

  const serializedProducts = products.map((product) => ({
    id: product._id.toString(),
    title: product.title,
    stock: product.stock,
    dp: product.dp,
    tp: product.tp,
    company: product.company,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      {authenticatedUser.role === "admin" ? <AdminHeader /> : <UserHeader />}

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <LedgerTable
          ledgerId={ledger._id.toString()}
          initialRows={ledger.rows || []}
          initialCompanyName={ledger.companyName}
          initialMarketName={ledger.marketName || ""}
          ledgerName={ledger.name}
          ledgerDate={ledger.ledgerDate}
          companies={serializedCompanies}
          markets={serializedMarkets}
          products={serializedProducts}
        />
      </div>
    </main>
  );
}
