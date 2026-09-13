import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {connectDB} from "@/lib/db";
import Admin from "@/lib/models/Admin";
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

    const admins = await Admin.find()
      .sort({createdAt: -1})
      .lean();

    return NextResponse.json({
      admins: admins.map((admin) => ({
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        active: admin.active,
      })),
    });
  } catch (error) {
    console.error("ADMIN ADMINS GET ERROR:", error);

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
    const password = body.password || "";
    const role = body.role || "admin";

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

    if (!["admin", "super_admin"].includes(role)) {
      return NextResponse.json(
        {message: "Invalid role."},
        {status: 400}
      );
    }

    await connectDB();

    const existingAdmin = await Admin.findOne({
      email,
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message:
            "An admin with this email already exists.",
        },
        {status: 409}
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role,
      active: true,
    });

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: newAdmin._id.toString(),
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          active: newAdmin.active,
        },
      },
      {status: 201}
    );
  } catch (error) {
    console.error("ADMIN CREATE ERROR:", error);

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
      password,
      role,
      active,
    } = body;

    if (!id) {
      return NextResponse.json(
        {message: "Admin id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const adminUser = await Admin.findById(id);

    if (!adminUser) {
      return NextResponse.json(
        {message: "Admin not found."},
        {status: 404}
      );
    }

    if (email !== undefined) {
      const newEmail = email.trim().toLowerCase();

      const existingAdmin = await Admin.findOne({
        email: newEmail,
        _id: {$ne: id},
      });

      if (existingAdmin) {
        return NextResponse.json(
          {
            message:
              "An admin with this email already exists.",
          },
          {status: 409}
        );
      }

      adminUser.email = newEmail;
    }

    if (name !== undefined) {
      adminUser.name = name.trim();
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

      adminUser.password = await bcrypt.hash(
        password,
        10
      );
    }

    if (role !== undefined) {
      if (
        !["admin", "super_admin"].includes(role)
      ) {
        return NextResponse.json(
          {message: "Invalid role."},
          {status: 400}
        );
      }

      adminUser.role = role;
    }

    if (active !== undefined) {
      if (typeof active !== "boolean") {
        return NextResponse.json(
          {message: "Invalid active status."},
          {status: 400}
        );
      }

      adminUser.active = active;
    }

    await adminUser.save();

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        active: adminUser.active,
      },
    });
  } catch (error) {
    console.error("ADMIN UPDATE ERROR:", error);

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
        {message: "Admin id is required."},
        {status: 400}
      );
    }

    await connectDB();

    const adminUser = await Admin.findByIdAndDelete(id);

    if (!adminUser) {
      return NextResponse.json(
        {message: "Admin not found."},
        {status: 404}
      );
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      id,
    });
  } catch (error) {
    console.error("ADMIN DELETE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Something went wrong.",
      },
      {status: 500}
    );
  }
}