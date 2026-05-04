/**
 * Multilingual instructor invitation copy (subject + plain text + HTML).
 * Mirrors the product tone: shared company dashboard, same fleet & simulations.
 */

export type InvitationLocale = "en" | "es" | "pt" | "ja";

export function normalizeLocale(input: string | undefined | null): InvitationLocale {
  if (!input || typeof input !== "string") return "en";
  const base = input.trim().toLowerCase().split("-")[0];
  if (base === "es" || base === "pt" || base === "ja") return base;
  return "en";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function greeting(name: string, locale: InvitationLocale): string {
  const n = name.trim();
  if (locale === "es") return n ? `Hola ${n},` : "Hola,";
  if (locale === "pt") return n ? `Olá ${n},` : "Olá,";
  if (locale === "ja") return n ? `${n} 様` : "こんにちは、";
  return n ? `Hi ${n},` : "Hello,";
}

function bodyLines(
  locale: InvitationLocale,
  company: string,
  dashboardUrl: string
): { subject: string; paragraphs: string[]; cta: string; signoff: string } {
  const c = company.trim() || (locale === "ja" ? "御社" : locale === "es" ? "su empresa" : locale === "pt" ? "sua empresa" : "your company");

  if (locale === "es") {
    return {
      subject: `Invitación: panel compartido de ${c} en KG App`,
      paragraphs: [
        `${c} te ha invitado como instructor/a al panel compartido de la empresa en KG App.`,
        "Allí verás el mismo parque de vehículos y las mismas simulaciones que el resto del equipo, para que todos trabajen con datos alineados.",
        "Abre el panel cuando estés listo/a:",
      ],
      cta: dashboardUrl,
      signoff: "Si no esperabas este correo, puedes ignorarlo.",
    };
  }
  if (locale === "pt") {
    return {
      subject: `Convite: painel compartilhado de ${c} no KG App`,
      paragraphs: [
        `${c} convidou você como instrutor(a) para o painel compartilhado da empresa no KG App.`,
        "Lá você verá a mesma frota de veículos e as mesmas simulações que o restante da equipe, para que todos trabalhem com dados alinhados.",
        "Acesse o painel quando estiver pronto(a):",
      ],
      cta: dashboardUrl,
      signoff: "Se você não esperava este e-mail, pode ignorá-lo.",
    };
  }
  if (locale === "ja") {
    return {
      subject: `【KG App】${c} 共有ダッシュボードへの招待`,
      paragraphs: [
        `${c}より、KG App の会社共有ダッシュボードへ講師として招待されています。`,
        "チームと同じ車両一覧・シミュレーションにアクセスし、データを揃えたうえで運用できます。",
        "準備ができたら、次のリンクからダッシュボードを開いてください。",
      ],
      cta: dashboardUrl,
      signoff: "心当たりがない場合は、このメールを破棄してください。",
    };
  }
  return {
    subject: `You're invited — ${c} shared dashboard on KG App`,
    paragraphs: [
      `${c} has invited you as an instructor to the company's shared dashboard on KG App.`,
      "You'll see the same vehicle fleet and simulations as the rest of the team, so everyone works from aligned data.",
      "Open the dashboard when you're ready:",
    ],
    cta: dashboardUrl,
    signoff: "If you weren't expecting this message, you can ignore it.",
  };
}

export function buildInvitationEmail(
  locale: InvitationLocale,
  params: { recipientName: string; companyName: string; dashboardUrl: string }
): { subject: string; text: string; html: string } {
  const loc = normalizeLocale(locale);
  const name = params.recipientName.trim() || (loc === "ja" ? "ご担当者" : "");
  const { subject, paragraphs, cta, signoff } = bodyLines(loc, params.companyName, params.dashboardUrl);
  const greet = greeting(name, loc);

  const text =
    [greet, "", ...paragraphs, "", cta, "", "—", "KG App", "", signoff].join("\n");

  const safeUrl = escapeHtml(params.dashboardUrl);
  const pHtml = paragraphs.map((p) => `<p style="margin:0 0 12px 0;line-height:1.5;">${escapeHtml(p)}</p>`).join("");
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#111;max-width:560px;">
<p style="margin:0 0 16px 0;">${escapeHtml(greet)}</p>
${pHtml}
<p style="margin:16px 0;"><a href="${safeUrl}" style="color:#0a7a0a;">${safeUrl}</a></p>
<p style="margin:24px 0 0 0;font-size:12px;color:#666;">${escapeHtml(signoff)}</p>
</body></html>`;

  return { subject, text, html };
}
