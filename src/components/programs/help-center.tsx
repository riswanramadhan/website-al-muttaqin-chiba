"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  BookOpenText,
  ChevronRight,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  MessageCircleQuestionMark,
  Phone,
  Siren,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IconCircle } from "@/components/ui/primitives";
import { SuggestionForm } from "@/components/programs/suggestion-form";
import type { SuggestionKind } from "@/components/programs/schemas";
import { cn } from "@/lib/utils/cn";

type FormCard = { key: "question" | "facility" | "suggestion" | "ustadz"; kind: SuggestionKind; icon: LucideIcon };
type EmergencyNumber = "119" | "110";

const FORM_CARDS: FormCard[] = [
  { key: "question", kind: "question", icon: MessageCircleQuestionMark },
  { key: "facility", kind: "facility", icon: Wrench },
  { key: "suggestion", kind: "suggestion", icon: Lightbulb },
  { key: "ustadz", kind: "ustadz", icon: BookOpenText },
];

const PHRASE_KEYS = ["1", "2", "3"] as const;

/**
 * Pusat bantuan jamaah (App): kartu aksi besar. Kartu formulir membuka SuggestionForm dalam Dialog;
 * darurat menampilkan nomor 119/110 dengan konfirmasi dan kalimat Jepang untuk dibacakan.
 */
export function HelpCenter({ locale, whatsapp, mapsUrl, email }: { locale: Locale; whatsapp: string; mapsUrl: string; email: string }) {
  const t = useTranslations("help");
  const tc = useTranslations("common");
  const [openForm, setOpenForm] = React.useState<FormCard | null>(null);
  const [emergencyOpen, setEmergencyOpen] = React.useState(false);
  const [confirmNumber, setConfirmNumber] = React.useState<EmergencyNumber | null>(null);

  const cardClass = "card-surface lift flex w-full items-center gap-4 p-4 text-left";

  return (
    <div className="space-y-6">
      <section aria-labelledby="help-forms">
        <h2 id="help-forms" className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {t("sections.ask")}
        </h2>
        <ul className="grid grid-cols-1 gap-3">
          {FORM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.key}>
                <button type="button" className={cardClass} onClick={() => setOpenForm(card)}>
                  <IconCircle tone="soft" shape="square">
                    <Icon />
                  </IconCircle>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{t(`cards.${card.key}.title`)}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{t(`cards.${card.key}.description`)}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="help-emergency">
        <h2 id="help-emergency" className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {t("sections.emergency")}
        </h2>
        <button type="button" className={cn(cardClass, "bg-destructive/10 border-destructive/30")} onClick={() => setEmergencyOpen(true)}>
          <IconCircle tone="brand" shape="square" className="bg-destructive text-destructive-foreground">
            <Siren />
          </IconCircle>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{t("cards.emergency.title")}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">{t("cards.emergency.description")}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </section>

      <section aria-labelledby="help-contact">
        <h2 id="help-contact" className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {t("sections.contact")}
        </h2>
        <ul className="grid grid-cols-1 gap-3">
          <li>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
              <IconCircle tone="soft" shape="square">
                <MapPin />
              </IconCircle>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{t("cards.location.title")}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{t("cards.location.description")}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          </li>
          <li>
            <a href={buildWhatsAppUrl(whatsapp, t("whatsapp.greeting"))} target="_blank" rel="noopener noreferrer" className={cardClass}>
              <IconCircle tone="soft" shape="square">
                <MessageCircle />
              </IconCircle>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{t("cards.whatsapp.title")}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{t("cards.whatsapp.description")}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          </li>
          <li>
            <a href={`mailto:${email}`} className={cardClass}>
              <IconCircle tone="soft" shape="square">
                <Mail />
              </IconCircle>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{t("cards.email.title")}</span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">{email}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          </li>
        </ul>
      </section>

      <Dialog open={openForm !== null} onOpenChange={(open) => !open && setOpenForm(null)}>
        <DialogContent closeLabel={tc("actions.close")}>
          {openForm && (
            <>
              <DialogHeader>
                <DialogTitle>{t(`cards.${openForm.key}.title`)}</DialogTitle>
                <DialogDescription>{t(`cards.${openForm.key}.description`)}</DialogDescription>
              </DialogHeader>
              <SuggestionForm key={openForm.kind} locale={locale} defaultKind={openForm.kind} onDone={() => setOpenForm(null)} />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={emergencyOpen}
        onOpenChange={(open) => {
          setEmergencyOpen(open);
          if (!open) setConfirmNumber(null);
        }}
      >
        <DialogContent closeLabel={tc("actions.close")}>
          <DialogHeader>
            <DialogTitle>{t("emergency.title")}</DialogTitle>
            <DialogDescription>{t("emergency.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="destructive" size="lg" className="h-auto flex-col gap-0.5 py-3" onClick={() => setConfirmNumber("119")}>
              <span className="text-2xl font-bold tabular">119</span>
              <span className="text-xs font-medium">{t("emergency.ambulance")}</span>
            </Button>
            <Button variant="secondary" size="lg" className="h-auto flex-col gap-0.5 py-3" onClick={() => setConfirmNumber("110")}>
              <span className="text-2xl font-bold tabular">110</span>
              <span className="text-xs font-medium">{t("emergency.police")}</span>
            </Button>
          </div>

          {confirmNumber && (
            <div className="card-muted space-y-3 p-4" role="alert">
              <p className="text-sm font-semibold">{t("emergency.confirm", { number: confirmNumber })}</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmNumber(null)}>
                  {tc("actions.cancel")}
                </Button>
                <a href={`tel:${confirmNumber}`} className={buttonVariants({ variant: "destructive" })}>
                  <Phone />
                  {t("emergency.callNow", { number: confirmNumber })}
                </a>
              </DialogFooter>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-semibold">{t("emergency.phrasesTitle")}</p>
            <ol className="space-y-3">
              {PHRASE_KEYS.map((k) => (
                <li key={k} className="card-surface p-4">
                  <p lang="ja" className="text-xl font-bold leading-relaxed">
                    {t(`emergency.phrases.${k}.ja`)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t(`emergency.phrases.${k}.reading`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`emergency.phrases.${k}.meaning`)}</p>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground">{t("emergency.tip")}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
