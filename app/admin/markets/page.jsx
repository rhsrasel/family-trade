import {connectDB} from "@/lib/db";
import Market from "@/lib/models/Market";
import MarketManager from "@/components/admin/MarketManager";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminMarketsPage() {
  await connectDB();

  const markets = await Market.find()
    .sort({createdAt: -1})
    .lean();

  const serializedMarkets = markets.map((market) => ({
    id: market._id.toString(),
    name: market.name,
    address: market.address,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Markets"
        description="Manage markets."
      />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <MarketManager
          initialMarkets={serializedMarkets}
        />
      </div>
    </main>
  );
}