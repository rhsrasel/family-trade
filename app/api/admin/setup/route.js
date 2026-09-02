import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/lib/models/Admin";

export async function POST(request) {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Initial setup is already completed." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "super_admin",
      active: true,
    });

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN SETUP ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Something went wrong.",
      },
      { status: 500 }
    );
  }
}