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

export async function GET(request, { params }) {
  try {
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    await connectDB();

    const ledger = await Ledger.findById(id).lean();

    if (!ledger) {
      return NextResponse.json(
        {
          message: "Ledger not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ledger: {
        id: ledger._id.toString(),
        name: ledger.name,
        companyName: ledger.companyName,
        marketName: ledger.marketName || "",
        ledgerDate: ledger.ledgerDate,
        createdBy: ledger.createdBy,
        rows: ledger.rows || [],
      },
    });
  } catch (error) {
    console.error("LEDGER GET ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Something went wrong.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const ledger = await Ledger.findById(id);

    if (!ledger) {
      return NextResponse.json(
        {
          message: "Ledger not found.",
        },
        { status: 404 },
      );
    }

    if (body.companyName !== undefined) {
      const companyName = body.companyName?.trim();

      if (!companyName) {
        return NextResponse.json(
          {
            message: "Company name is required.",
          },
          { status: 400 },
        );
      }

      ledger.companyName = companyName;
    }

    if (body.marketName !== undefined) {
      const marketName = body.marketName?.trim();

      if (!marketName) {
        return NextResponse.json(
          {
            message: "Market name is required.",
          },
          { status: 400 },
        );
      }

      ledger.marketName = marketName;
    }

    if (body.rows !== undefined) {
      if (!Array.isArray(body.rows)) {
        return NextResponse.json(
          {
            message: "Rows must be an array.",
          },
          { status: 400 },
        );
      }

      ledger.rows = body.rows;
    }

    await ledger.save();

    return NextResponse.json({
      success: true,
      ledger: {
        id: ledger._id.toString(),
        name: ledger.name,
        companyName: ledger.companyName,
        marketName: ledger.marketName || "",
        ledgerDate: ledger.ledgerDate,
        createdBy: ledger.createdBy,
        rows: ledger.rows || [],
      },
    });
  } catch (error) {
    console.error("LEDGER UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
