import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const {
      email, password, firstName, lastName, phone,
      street, city, country, postalCode, dateOfBirth,
    } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First and last name required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const name = `${firstName} ${lastName}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        firstName,
        lastName,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    if (street && city && country && postalCode) {
      await prisma.address.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          address1: street,
          city,
          country,
          postalCode,
          phone: phone || null,
          isDefault: true,
        },
      });
    }

    await setSessionCookie(user.id);

    sendWelcomeEmail(user.email, user.name).catch(console.error);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
