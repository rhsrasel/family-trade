import {NextResponse} from "next/server";

import {connectDB} from "@/lib/db";
import Market from "@/lib/models/Market";
import {getAdminFromRequest} from "@/lib/auth";

export async function GET(request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        {message: "Unauthorized."},
        {status: 401}
      );
    }

    await connectDB();

    const markets = await Market.find()
      .sort({createdAt: -1})
      .lean();

    return NextResponse.json({
      markets: markets.map((market) => ({
        id: market._id.toString(),
        name: market.name,
        address: market.address,
      })),
      total: markets.length,
    });
  } catch (error) {
    console.error("MARKETS GET ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}

export async function POST(request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        {message: "Unauthorized."},
        {status: 401}
      );
    }

    const {name, address} = await request.json();

    const marketName = name?.trim();
    const marketAddress = address?.trim();

    if (!marketName || !marketAddress) {
      return NextResponse.json(
        {
          message:
            "Market name and address are required.",
        },
        {status: 400}
      );
    }

    await connectDB();

    const existingMarket = await Market.findOne({
      name: marketName,
    });

    if (existingMarket) {
      return NextResponse.json(
        {message: "Market already exists."},
        {status: 409}
      );
    }

    const market = await Market.create({
      name: marketName,
      address: marketAddress,
    });

    const total = await Market.countDocuments();

    return NextResponse.json(
      {
        success: true,
        market: {
          id: market._id.toString(),
          name: market.name,
          address: market.address,
        },
        total,
      },
      {status: 201}
    );
  } catch (error) {
    console.error("MARKET CREATE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}

export async function PATCH(request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        {message: "Unauthorized."},
        {status: 401}
      );
    }

    const {id, name, address} =
      await request.json();

    const marketName = name?.trim();
    const marketAddress = address?.trim();

    if (!id || !marketName || !marketAddress) {
      return NextResponse.json(
        {
          message:
            "Market id, name and address are required.",
        },
        {status: 400}
      );
    }

    await connectDB();

    const existingMarket = await Market.findOne({
      name: marketName,
      _id: {$ne: id},
    });

    if (existingMarket) {
      return NextResponse.json(
        {message: "Market already exists."},
        {status: 409}
      );
    }

    const market = await Market.findById(id);

    if (!market) {
      return NextResponse.json(
        {message: "Market not found."},
        {status: 404}
      );
    }

    market.name = marketName;
    market.address = marketAddress;

    await market.save();

    return NextResponse.json({
      success: true,
      market: {
        id: market._id.toString(),
        name: market.name,
        address: market.address,
      },
    });
  } catch (error) {
    console.error("MARKET UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}

export async function DELETE(request) {
  try {
    const admin = await getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        {message: "Unauthorized."},
        {status: 401}
      );
    }

    const {id} = await request.json();

    if (!id) {
      return NextResponse.json(
        {message: "Market id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const market = await Market.findById(id);

    if (!market) {
      return NextResponse.json(
        {message: "Market not found."},
        {status: 404}
      );
    }

    await Market.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      deleted: true,
      id,
    });
  } catch (error) {
    console.error("MARKET DELETE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}