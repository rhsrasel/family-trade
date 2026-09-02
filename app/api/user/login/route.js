// app/api/user/login/route.js

import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {connectDB} from "@/lib/db";
import User from "@/lib/models/User";
import {createToken} from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const {email, password} = await request.json();

    const user = await User.findOne({
      email: email?.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {message: "Invalid email or password."},
        {status: 401}
      );
    }

    const passwordMatch = await bcrypt.compare(
      password || "",
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {message: "Invalid email or password."},
        {status: 401}
      );
    }

    if (user.status === "pending") {
      return NextResponse.json(
        {
          message:
            "Your account is pending admin approval. Please try again after your account has been approved.",
        },
        {status: 403}
      );
    }

    if (user.status === "rejected") {
      return NextResponse.json(
        {
          message:
            "Your account application has been rejected.",
        },
        {status: 403}
      );
    }

    if (user.status !== "approved") {
      return NextResponse.json(
        {
          message: "Your account is not approved.",
        },
        {status: 403}
      );
    }

    const token = await createToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: "user",
      },
    });

    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("USER LOGIN ERROR:", error);

    return NextResponse.json(
      {message: "Server error."},
      {status: 500}
    );
  }
}