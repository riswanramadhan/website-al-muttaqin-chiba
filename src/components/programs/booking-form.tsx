"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { LoaderCircle, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { requestRoomBooking } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { BOOKING_PURPOSES, buildBookingSchema, type BookingInput, type BookingValues, type SubmitOutcome } from "@/components/programs/schemas";
import { FormOutcome, HoneypotField, useFieldErrorText } from "@/components/programs/form-outcome";

export type BookingRoomOption = { id: string; name: string; capacity: number };

/** Formulir peminjaman ruangan: ruangan, keperluan, penanggung jawab, tanggal & jam, jumlah hadir, catatan. */
export function BookingForm({ locale, rooms, todayKey }: { locale: Locale; rooms: BookingRoomOption[]; todayKey: string }) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const toast = useToast();
  const errorText = useFieldErrorText();
  const [outcome, setOutcome] = React.useState<SubmitOutcome | null>(null);
  const [pending, startTransition] = React.useTransition();
  const schema = React.useMemo(() => buildBookingSchema(rooms, todayKey), [rooms, todayKey]);

  const form = useForm<BookingInput, unknown, BookingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomId: rooms[0]?.id ?? "",
      purpose: "meeting",
      organizerName: "",
      organizerContact: "",
      date: "",
      startTime: "",
      endTime: "",
      attendees: "",
      notes: "",
      consent: false,
      honeypot: "",
      locale,
    },
  });
  const { register, handleSubmit, formState, setError, reset, control } = form;
  const errors = formState.errors;
  const roomId = useWatch({ control, name: "roomId" });
  const selectedRoom = rooms.find((r) => r.id === roomId);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const res = await requestRoomBooking({ ...values, locale });
      if (res.ok) {
        setOutcome(res.data ?? { fallback: null });
        toast({ title: tc("actions.sent"), tone: "success" });
        return;
      }
      if (res.error === "validation" && res.fieldErrors) {
        for (const [path, message] of Object.entries(res.fieldErrors)) {
          setError(path as keyof BookingInput, { message });
        }
        toast({ title: tc("errors.validation"), tone: "error" });
        return;
      }
      toast({ title: res.error === "rate_limit" ? tc("errors.tooMany") : tc("errors.generic"), tone: "error" });
    });
  });

  if (outcome) {
    return (
      <FormOutcome
        outcome={outcome}
        successTitle={t("form.success.title")}
        successBody={t("form.success.body")}
        fallbackTitle={t("form.fallback.title")}
        fallbackBody={t("form.fallback.body")}
        onReset={() => {
          reset();
          setOutcome(null);
        }}
        resetLabel={t("form.another")}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <HoneypotField {...register("honeypot")} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("form.room")} htmlFor="bk-room" required hint={selectedRoom ? t("form.roomHint", { count: selectedRoom.capacity }) : undefined} error={errorText(errors.roomId?.message)}>
          <Select id="bk-room" aria-invalid={Boolean(errors.roomId)} {...register("roomId")}>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("form.purpose")} htmlFor="bk-purpose" required error={errorText(errors.purpose?.message)}>
          <Select id="bk-purpose" aria-invalid={Boolean(errors.purpose)} {...register("purpose")}>
            {BOOKING_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {t(`purposes.${p}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("form.organizerName")} htmlFor="bk-name" required error={errorText(errors.organizerName?.message)}>
          <Input id="bk-name" autoComplete="name" aria-invalid={Boolean(errors.organizerName)} {...register("organizerName")} />
        </Field>
        <Field label={t("form.organizerContact")} htmlFor="bk-contact" required hint={t("form.contactHint")} error={errorText(errors.organizerContact?.message)}>
          <Input id="bk-contact" autoComplete="tel" aria-invalid={Boolean(errors.organizerContact)} {...register("organizerContact")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label={t("form.date")} htmlFor="bk-date" required error={errorText(errors.date?.message)}>
          <Input id="bk-date" type="date" min={todayKey} aria-invalid={Boolean(errors.date)} {...register("date")} />
        </Field>
        <Field label={t("form.startTime")} htmlFor="bk-start" required error={errorText(errors.startTime?.message)}>
          <Input id="bk-start" type="time" step={900} aria-invalid={Boolean(errors.startTime)} {...register("startTime")} />
        </Field>
        <Field label={t("form.endTime")} htmlFor="bk-end" required error={errorText(errors.endTime?.message)}>
          <Input id="bk-end" type="time" step={900} max="22:00" aria-invalid={Boolean(errors.endTime)} {...register("endTime")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[10rem_1fr]">
        <Field label={t("form.attendees")} htmlFor="bk-attendees" required error={errorText(errors.attendees?.message)}>
          <Input id="bk-attendees" type="number" inputMode="numeric" min={1} max={selectedRoom?.capacity} aria-invalid={Boolean(errors.attendees)} {...register("attendees")} />
        </Field>
        <Field label={t("form.notes")} htmlFor="bk-notes" optionalLabel={tc("labels.optional")} error={errorText(errors.notes?.message)}>
          <Textarea id="bk-notes" className="min-h-11" rows={2} placeholder={t("form.notesPlaceholder")} {...register("notes")} />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <Checkbox aria-invalid={Boolean(errors.consent)} {...register("consent")} />
          <span>
            {tc("consent.privacy")}{" "}
            <Link href="/privacy" className="font-semibold text-brand underline-offset-4 hover:underline">
              {tc("consent.privacyLink")}
            </Link>
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-destructive" role="alert">
            {errorText(errors.consent.message)}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
        {pending ? tc("actions.sending") : t("form.submit")}
      </Button>
    </form>
  );
}
