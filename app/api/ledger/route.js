import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ledger from "@/lib/models/Ledger";
import { getAdminFromRequest, getUserFromRequest } from "@/lib/auth";

async function getAuthenticatedUser(request) {
  const admin = await getAdminFromRequest(request);

  if (admin) {
    return {
      id: admin.id?.toString() || admin.sub?.toString(),
      role: "admin",
    };
  }

  const user = await getUserFromRequest(request);

  if (user) {
    return {
      id: user.id?.toString() || user.sub?.toString(),
      role: "user",
    };
  }

  return null;
}

function createLedgerName(companyName, marketName, date) {
  const cleanName = (value) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const cleanCompanyName = cleanName(companyName);
  const cleanMarketName = cleanName(marketName);

  const day = String(date.getDate()).padStart(2, "0");

  const month = date
    .toLocaleString("en-US", {
      month: "short",
    })
    .toLowerCase();

  const year = date.getFullYear();

  const uniqueId = Date.now().toString().slice(-6);

  return `${cleanCompanyName}_${cleanMarketName}_${day}_${month}_${year}_${uniqueId}`;
}

export async function GET(request) {
  try {
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    await connectDB();

    const ledgers = await Ledger.find()
      .sort({
        ledgerDate: -1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      ledgers: ledgers.map((ledger) => ({
        id: ledger._id.toString(),
        name: ledger.name,
        companyName: ledger.companyName || "",
        marketName: ledger.marketName || "",
        ledgerDate: ledger.ledgerDate,
        createdBy: ledger.createdBy,
        rows: ledger.rows || [],
      })),
    });
  } catch (error) {
    console.error("GET /api/ledger error:", error);

    return NextResponse.json(
      {
        message: error?.message || "Failed to load ledgers",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const companyName = body.companyName?.trim();
    const marketName = body.marketName?.trim();

    const ledgerDate = body.ledgerDate ? new Date(body.ledgerDate) : new Date();

    if (!companyName) {
      return NextResponse.json(
        {
          message: "Company name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!marketName) {
      return NextResponse.json(
        {
          message: "Market name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (Number.isNaN(ledgerDate.getTime())) {
      return NextResponse.json(
        {
          message: "Invalid ledger date",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const name = createLedgerName(companyName, marketName, ledgerDate);

    const ledger = await Ledger.create({
      name,
      companyName,
      marketName,
      ledgerDate,
      createdBy: authenticatedUser.id,
      rows: [],
    });

    return NextResponse.json(
      {
        message: "Ledger created successfully",
        ledger: {
          id: ledger._id.toString(),
          name: ledger.name,
          companyName: ledger.companyName,
          marketName: ledger.marketName || "",
          ledgerDate: ledger.ledgerDate,
          createdBy: ledger.createdBy,
          rows: ledger.rows || [],
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/ledger error:", error);

    return NextResponse.json(
      {
        message: error?.message || "Failed to create ledger",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request) {
  try {
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "Ledger ID is required",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const ledger = await Ledger.findById(id);

    if (!ledger) {
      return NextResponse.json(
        {
          message: "Ledger not found",
        },
        {
          status: 404,
        },
      );
    }

    await Ledger.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Ledger deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/ledger error:", error);

    return NextResponse.json(
      {
        message: error?.message || "Failed to delete ledger",
      },
      {
        status: 500,
      },
    );
  }
}
