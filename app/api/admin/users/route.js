import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {connectDB} from "@/lib/db";
import User from "@/lib/models/User";
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

    const users = await User.find()
      .sort({createdAt: -1})
      .lean();

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        access: user.access,
      })),
    });
  } catch (error) {
    console.error("ADMIN USERS GET ERROR:", error);

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

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || "";
    const password = body.password || "";

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message:
            "Name, email and password are required.",
        },
        {status: 400}
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 4 characters.",
        },
        {status: 400}
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "A user with this email already exists.",
        },
        {status: 409}
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,

      // Admin-created users are approved by default.
      status: "approved",

      access: {
        shop: false,
        cart: false,
        orders: false,
        profile: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          access: user.access,
        },
      },
      {status: 201}
    );
  } catch (error) {
    console.error("ADMIN USER CREATE ERROR:", error);

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
      name,
      email,
      phone,
      password,
      status,
      access,
    } = body;

    if (!id) {
      return NextResponse.json(
        {message: "User id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {message: "User not found."},
        {status: 404}
      );
    }

    if (email !== undefined) {
      const newEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: newEmail,
        _id: {$ne: id},
      });

      if (existingUser) {
        return NextResponse.json(
          {
            message:
              "A user with this email already exists.",
          },
          {status: 409}
        );
      }

      user.email = newEmail;
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (password !== undefined && password !== "") {
      if (password.length < 4) {
        return NextResponse.json(
          {
            message:
              "Password must be at least 4 characters.",
          },
          {status: 400}
        );
      }

      user.password = await bcrypt.hash(
        password,
        10
      );
    }

    if (status !== undefined) {
      if (
        !["pending", "approved"].includes(status)
      ) {
        return NextResponse.json(
          {message: "Invalid status."},
          {status: 400}
        );
      }

      user.status = status;
    }

    if (access) {
      for (const key of [
        "shop",
        "cart",
        "orders",
        "profile",
      ]) {
        if (typeof access[key] === "boolean") {
          user.access[key] = access[key];
        }
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        access: user.access,
      },
    });
  } catch (error) {
    console.error("ADMIN USER UPDATE ERROR:", error);

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
        {message: "User id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        {message: "User not found."},
        {status: 404}
      );
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      id,
    });
  } catch (error) {
    console.error("ADMIN USER DELETE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}