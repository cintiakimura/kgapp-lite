import { NextRequest, NextResponse } from "next/server";
import { buildInvitationEmail, normalizeLocale, type InvitationLocale } from "@/lib/invitation-i18n";
import { sendInviteMail } from "@/lib/send-invite-mail";

type InstructorRow = {
  fullName?: string;
  email?: string;
  locale?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseDashboardUrl(raw: string | undefined): string {
  const fallbackBase =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const fallback = `${fallbackBase}/company-dashboard.html`;

  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return fallback;
  }
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return fallback;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return fallback;
  }
  return u.toString();
}

function rowLocale(row: InstructorRow, defaultLocale: InvitationLocale): InvitationLocale {
  const raw = row.locale;
  if (raw && typeof raw === "string" && raw.trim()) {
    return normalizeLocale(raw);
  }
  return defaultLocale;
}

export async function POST(req: NextRequest) {
  if (process.env.INVITE_DRY_RUN === "1") {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.instructors) ? body.instructors : [];
    return NextResponse.json({
      dryRun: true,
      wouldSendTo: list.map((r: InstructorRow) => String(r?.email || "").trim()).filter(Boolean),
    });
  }

  let body: {
    companyName?: string;
    instructors?: InstructorRow[];
    locale?: string;
    dashboardUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const instructors = Array.isArray(body.instructors) ? body.instructors : [];
  const validRows = instructors.filter((r) => {
    const em = String(r?.email || "").trim();
    return em && EMAIL_RE.test(em);
  });

  if (!validRows.length) {
    return NextResponse.json(
      { error: "No valid instructor emails. Each row needs a valid email address." },
      { status: 400 }
    );
  }

  const defaultLocale = normalizeLocale(body.locale);
  const companyName =
    typeof body.companyName === "string" ? body.companyName : "Your company";
  const dashboardUrl = parseDashboardUrl(body.dashboardUrl);

  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const row of validRows) {
    const email = String(row.email).trim();
    const recipientName = String(row.fullName || "").trim();
    const loc = rowLocale(row, defaultLocale);

    try {
      const { subject, text, html } = buildInvitationEmail(loc, {
        recipientName,
        companyName,
        dashboardUrl,
      });
      await sendInviteMail({ to: email, subject, text, html });
      results.push({ email, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Send failed";
      results.push({ email, ok: false, error: msg });
    }
  }

  const failed = results.filter((r) => !r.ok);
  const sent = results.filter((r) => r.ok).length;

  if (failed.length && sent === 0) {
    return NextResponse.json(
      {
        error: "All sends failed. Check EMAIL_FROM and RESEND_API_KEY or SMTP settings.",
        results,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    sent,
    failed: failed.length,
    results,
  });
}
