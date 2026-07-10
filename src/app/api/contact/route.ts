import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators/contact";
import { sendContactFormEmail, sendContactAutoReplyEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    // Fire-and-forget: notify support + auto-reply to user
    sendContactFormEmail(validated).catch(console.error);
    sendContactAutoReplyEmail(validated).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact form:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
