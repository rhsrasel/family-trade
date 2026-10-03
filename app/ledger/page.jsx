import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import Ledger from "@/lib/models/Ledger";
import Company from "@/lib/models/Company";
import Market from "@/lib/models/Market";
import AdminHeader from "@/components/admin/AdminHeader";
import UserHeader from "@/components/user/UserHeader";
import LedgerManager from "@/components/ledger/LedgerManager";

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

export default async function LedgerPage() {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    redirect("/admin/login");
  }

  await connectDB();

  const [ledgers, companies, markets] = await Promise.all([
    Ledger.find()
      .sort({
        ledgerDate: -1,
        createdAt: -1,
      })
      .lean(),

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
  ]);

  const serializedLedgers = ledgers.map((ledger) => ({
    id: ledger._id.toString(),
    name: ledger.name,
    companyName: ledger.companyName,
    marketName: ledger.marketName || "",
    ledgerDate: ledger.ledgerDate.toISOString(),
    createdBy: ledger.createdBy,
    rows: ledger.rows || [],
  }));

  const serializedCompanies = companies.map((company) => ({
    id: company._id.toString(),
    name: company.name,
  }));

  const serializedMarkets = markets.map((market) => ({
    id: market._id.toString(),
    name: market.name,
    address: market.address,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      {authenticatedUser.role === "admin" ? <AdminHeader /> : <UserHeader />}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <LedgerManager
          initialLedgers={serializedLedgers}
          companies={serializedCompanies}
          markets={serializedMarkets}
        />
      </div>
    </main>
  );
}
