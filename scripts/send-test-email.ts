import { config } from "dotenv";
import { sendWelcomeEmail } from "../src/lib/email";

config();

async function main() {
  const to = process.argv[2] || "yaroslav7v@gmail.com";
  const name = process.argv[3] || "Yaroslav";

  console.log(`Sending test welcome email to ${to} (as ${name})...`);
  console.log(`API key: ${process.env.RESEND_API_KEY ? "set" : "MISSING"}`);
  console.log(`From:    ${process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || "MISSING"}`);

  const ok = await sendWelcomeEmail(to, name);

  if (ok) {
    console.log(`✓ Sent successfully to ${to}`);
    process.exit(0);
  } else {
    console.error(`✗ Failed to send to ${to} — check logs above`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
