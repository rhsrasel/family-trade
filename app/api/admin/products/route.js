import {NextResponse} from "next/server";
import {connectDB} from "@/lib/db";
import Product from "@/lib/models/Product";
import Company from "@/lib/models/Company";
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

    const products = await Product.find()
      .sort({createdAt: -1})
      .lean();

    return NextResponse.json({
      products: products.map((product) => ({
        id: product._id.toString(),
        title: product.title,
        stock: product.stock,
        dp: product.dp,
        tp: product.tp,
        company: product.company,
        orderHistory: product.orderHistory || [],
      })),
    });
  } catch (error) {
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

    const body = await request.json();

    const title = body.title?.trim();
    const company = body.company?.trim();
    const stock = Number(body.stock);
    const dp = Number(body.dp);
    const tp = Number(body.tp);

    if (!title || !company) {
      return NextResponse.json(
        {message: "Title and company are required."},
        {status: 400}
      );
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0 ||
      !Number.isFinite(dp) ||
      dp < 0 ||
      !Number.isFinite(tp) ||
      tp < 0
    ) {
      return NextResponse.json(
        {message: "Invalid stock, DP or TP value."},
        {status: 400}
      );
    }

    await connectDB();

    const existingCompany = await Company.findOne({
      name: company,
    });

    if (!existingCompany) {
      return NextResponse.json(
        {message: "Please create the company first."},
        {status: 400}
      );
    }

    const product = await Product.create({
      title,
      stock,
      dp,
      tp,
      company,
    });

    return NextResponse.json(
      {
        success: true,
        product: {
          id: product._id.toString(),
          title: product.title,
          stock: product.stock,
          dp: product.dp,
          tp: product.tp,
          company: product.company,
          orderHistory: [],
        },
      },
      {status: 201}
    );
  } catch (error) {
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

    const body = await request.json();

    const {
      id,
      title,
      stock,
      dp,
      tp,
      company,
      order,
    } = body;

    if (!id) {
      return NextResponse.json(
        {message: "Product id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {message: "Product not found."},
        {status: 404}
      );
    }

    if (order) {
      const quantity = Number(order.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json(
          {
            message:
              "Order quantity must be greater than 0.",
          },
          {status: 400}
        );
      }

      if (quantity > product.stock) {
        return NextResponse.json(
          {
            message:
              "Order quantity cannot be greater than available stock.",
          },
          {status: 400}
        );
      }

      const orderDate = order.date
        ? new Date(order.date)
        : new Date();

      if (Number.isNaN(orderDate.getTime())) {
        return NextResponse.json(
          {message: "Invalid order date."},
          {status: 400}
        );
      }

      product.stock -= quantity;

      product.orderHistory.push({
        quantity,
        type: "sale",
        note: order.note || "",
        date: orderDate,
      });
    }

    if (title !== undefined) {
      product.title = title.trim();
    }

    if (stock !== undefined) {
      const value = Number(stock);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {message: "Invalid stock value."},
          {status: 400}
        );
      }

      product.stock = value;
    }

    if (dp !== undefined) {
      const value = Number(dp);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {message: "Invalid DP value."},
          {status: 400}
        );
      }

      product.dp = value;
    }

    if (tp !== undefined) {
      const value = Number(tp);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return NextResponse.json(
          {message: "Invalid TP value."},
          {status: 400}
        );
      }

      product.tp = value;
    }

    if (company !== undefined) {
      const companyName = company.trim();

      const existingCompany = await Company.findOne({
        name: companyName,
      });

      if (!existingCompany) {
        return NextResponse.json(
          {message: "Company does not exist."},
          {status: 400}
        );
      }

      product.company = companyName;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      product: {
        id: product._id.toString(),
        title: product.title,
        stock: product.stock,
        dp: product.dp,
        tp: product.tp,
        company: product.company,
        orderHistory: product.orderHistory || [],
      },
    });
  } catch (error) {
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
        {message: "Product id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {message: "Product not found."},
        {status: 404}
      );
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}