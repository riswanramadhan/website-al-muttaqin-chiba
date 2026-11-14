"use server";

import { randomUUID } from "node:crypto";
import { getTranslations } from "next-intl/server";
import { createAction } from "@/lib/actions";
import { getDonationAccounts, getDonationPrograms, getProfile } from "@/lib/data";
import { formatCurrency, pick } from "@/lib/utils/i18n";
import { buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import {
  confirmDonationSchema,
  recurringDonorSchema,
  type ConfirmDonationValues,
  type DonationActionOutput,
  type RecurringDonorValues,
} from "@/components/donate/schemas";
import { formatUniqueCode, splitUniqueAmount } from "@/components/donate/unique-amount";

/**
 * Konfirmasi transfer (PRD-05 §5). Simpan ke `donation_confirmations` bila Supabase aktif,
 * selain itu kembalikan tautan WhatsApp berisi pesan yang sama agar jamaah tetap bisa mengirim.
 */
export const confirmDonation = createAction<ConfirmDonationValues, DonationActionOutput>({
  name: "confirmDonation",
  schema: confirmDonationSchema,
  rateLimit: { max: 5, windowMs: 60_000 },
  handler: async (data, ctx) => {
    const { code } = splitUniqueAmount(data.amount);
    if (ctx.supabase) {
      const id = randomUUID();
      const { error } = await ctx.supabase
        .from("donation_confirmations")
        .insert({
          id,
          program_slug: data.programSlug,
          account_id: data.accountId,
          currency: data.currency,
          amount: data.amount,
          unique_code: code > 0 ? code : null,
          transferred_at: data.transferredAt,
          donor_name: data.donorName || null,
          donor_contact: data.donorContact || null,
          on_behalf_of: data.onBehalfOf || null,
          message: data.message || null,
          locale: ctx.locale,
        });
      if (error) throw error;
      return { fallback: null, id };
    }

    const [profile, programs, accounts, t] = await Promise.all([
      getProfile(),
      getDonationPrograms(),
      getDonationAccounts(),
      getTranslations({ locale: ctx.locale, namespace: "donate" }),
    ]);
    const program = programs.find((p) => p.slug === data.programSlug);
    const account = accounts.find((a) => a.id === data.accountId);
    const message = composeMessage(t("whatsapp.confirmTitle"), [
      [t("whatsapp.labels.program"), program ? pick(program.title, ctx.locale) : data.programSlug],
      [t("whatsapp.labels.account"), account ? `${pick(account.bankNameLocalized, ctx.locale) || account.bankName} (${account.accountNumber})` : data.accountId],
      [t("whatsapp.labels.currency"), data.currency],
      [t("whatsapp.labels.amount"), formatCurrency(data.amount, data.currency, ctx.locale)],
      [t("whatsapp.labels.uniqueCode"), code > 0 ? formatUniqueCode(code) : undefined],
      [t("whatsapp.labels.date"), data.transferredAt],
      [t("whatsapp.labels.name"), data.donorName || t("whatsapp.labels.anonymous")],
      [t("whatsapp.labels.contact"), data.donorContact],
      [t("whatsapp.labels.onBehalf"), data.onBehalfOf],
      [t("whatsapp.labels.message"), data.message],
    ]);
    return { fallback: "whatsapp", url: buildWhatsAppUrl(profile.whatsapp, message), message };
  },
});

/** Pendaftaran donatur tetap (PRD-05 §6) ke `recurring_donors`, dengan fallback WhatsApp. */
export const registerRecurringDonor = createAction<RecurringDonorValues, DonationActionOutput>({
  name: "registerRecurringDonor",
  schema: recurringDonorSchema,
  rateLimit: { max: 3, windowMs: 60_000 },
  handler: async (data, ctx) => {
    if (ctx.supabase) {
      const id = randomUUID();
      const { error } = await ctx.supabase
        .from("recurring_donors")
        .insert({
          id,
          full_name: data.fullName,
          contact: data.contact,
          monthly_amount: data.monthlyAmount,
          currency: data.currency,
          payment_day: data.paymentDay,
          method: data.method,
          publish_name: data.publishName,
          consent: data.consent,
          locale: ctx.locale,
        });
      if (error) throw error;
      return { fallback: null, id };
    }

    const [profile, t] = await Promise.all([getProfile(), getTranslations({ locale: ctx.locale, namespace: "donate" })]);
    const message = composeMessage(t("whatsapp.recurringTitle"), [
      [t("whatsapp.labels.name"), data.fullName],
      [t("whatsapp.labels.contact"), data.contact],
      [t("whatsapp.labels.monthlyAmount"), formatCurrency(data.monthlyAmount, data.currency, ctx.locale)],
      [t("whatsapp.labels.paymentDay"), data.paymentDay],
      [t("whatsapp.labels.method"), t(`recurring.fields.methods.${data.method}`)],
      [t("whatsapp.labels.publishName"), data.publishName ? t("whatsapp.labels.yes") : t("whatsapp.labels.no")],
    ]);
    return { fallback: "whatsapp", url: buildWhatsAppUrl(profile.whatsapp, message), message };
  },
});
