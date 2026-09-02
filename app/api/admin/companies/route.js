import {NextResponse} from "next/server";
import {connectDB} from "@/lib/db";
import Company from "@/lib/models/Company";
import Product from "@/lib/models/Product";
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

    return NextResponse.json({
      companies: companies.map((company) => ({
        id: company._id.toString(),
        name: company.name,
        productsCount: productCounts[company.name] || 0,
      })),
      total: companies.length,
    });
  } catch (error) {
    console.error("COMPANIES GET ERROR:", error);

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

    const {name} = await request.json();
    const companyName = name?.trim();

    if (!companyName) {
      return NextResponse.json(
        {message: "Company name is required."},
        {status: 400}
      );
    }

    await connectDB();

    const existingCompany = await Company.findOne({
      name: companyName,
    });

    if (existingCompany) {
      return NextResponse.json(
        {message: "Company already exists."},
        {status: 409}
      );
    }

    const company = await Company.create({
      name: companyName,
    });

    const total = await Company.countDocuments();

    return NextResponse.json(
      {
        success: true,
        company: {
          id: company._id.toString(),
          name: company.name,
          productsCount: 0,
        },
        total,
      },
      {status: 201}
    );
  } catch (error) {
    console.error("COMPANY CREATE ERROR:", error);

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

    const {id, name} = await request.json();
    const companyName = name?.trim();

    if (!id || !companyName) {
      return NextResponse.json(
        {message: "Company id and name are required."},
        {status: 400}
      );
    }

    await connectDB();

    const existingCompany = await Company.findOne({
      name: companyName,
      _id: {$ne: id},
    });

    if (existingCompany) {
      return NextResponse.json(
        {message: "Company already exists."},
        {status: 409}
      );
    }

    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json(
        {message: "Company not found."},
        {status: 404}
      );
    }

    const oldName = company.name;

    company.name = companyName;

    await company.save();

    if (oldName !== companyName) {
      await Product.updateMany(
        {company: oldName},
        {$set: {company: companyName}}
      );
    }

    const productsCount = await Product.countDocuments({
      company: companyName,
    });

    return NextResponse.json({
      success: true,
      company: {
        id: company._id.toString(),
        name: company.name,
        productsCount,
      },
    });
  } catch (error) {
    console.error("COMPANY UPDATE ERROR:", error);

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
        {message: "Company id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json(
        {message: "Company not found."},
        {status: 404}
      );
    }

    const productsCount = await Product.countDocuments({
      company: company.name,
    });

    if (productsCount > 0) {
      return NextResponse.json(
        {
          message:
            "This company has products. Remove or move the products before deleting the company.",
        },
        {status: 409}
      );
    }

    await Company.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      deleted: true,
      id,
    });
  } catch (error) {
    console.error("COMPANY DELETE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}