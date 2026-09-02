// app/api/admin/login/route.js

import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {connectDB} from "@/lib/db";
import Admin from "@/lib/models/Admin";
import {createToken} from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const {email, password} = await request.json();

    const admin = await Admin.findOne({
      email: email?.toLowerCase(),
    });

    if (
      !admin ||
      !admin.active ||
      !(await bcrypt.compare(password || "", admin.password))
    ) {
      return NextResponse.json(
        {message: "Invalid email or password."},
        {status: 401}
      );
    }

    const token = await createToken(admin);

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return NextResponse.json(
      {message: "Server error."},
      {status: 500}
    );
  }
}