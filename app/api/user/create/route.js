// app/api/user/create/route.js

import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {connectDB} from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      password,
      message,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email and password are required.",
        },
        {status: 400}
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        {
          message: "Password must be at least 4 characters.",
        },
        {status: 400}
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        {status: 409}
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      password: hashedPassword,
      message: message || "",
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Application submitted successfully. It is pending admin approval.",
        id: user._id.toString(),
      },
      {status: 201}
    );
  } catch (error) {
    console.error("USER CREATE ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Server error.",
      },
      {status: 500}
    );
  }
}