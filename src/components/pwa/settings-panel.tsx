"use client";

import * as React from "react";
import { AudioLines, Bell, BellOff, BellRing, CircleCheck, HardDrive, Info, Languages, LocateFixed, Landmark, Monitor, Moon, Play, Send, Smartphone, Square, Sun, SunMoon, TriangleAlert, Type, Vibrate, Volume1, Volume2, VolumeX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { localeNames } from "@/i18n/routing";
import type { Locale, ObligatoryPrayer } from "@/lib/types";
import { OBLIGATORY_PRAYERS } from "@/lib/prayer";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IconCircle, Separator } from "@/components/ui/primitives";
import { SwitchRow } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useTheme, type ThemeMode } from "@/components/shared/theme-provider";
import { ArabicSizeControl, useArabicSizeClass } from "@/components/worship";
import { useStandalone } from "./browser-state";
import { InstallButton, IosSteps } from "./install-prompt";
import { clearSiteStorage, useLocalValue, writeLocal } from "./local-store";
import { usePushSubscription } from "./use-push-subscription";
import { previewSound, setPlayingVolume, stopAlertSound, triggerAlert, unlockAudio, useAdhanAlert, useSoundSettings, warmAdhanCache, type SoundMode } from "./adhan-sound";

export const QIBLA_LOCATION_KEY = "acc-qibla-location";
export type QiblaLocationMode = "device" | "mosque";

const LOCALES: Locale[] = ["ja", "en", "id"];
const THEMES: { mode: ThemeMode; icon: React.ComponentType<{ className?: string }> }[] = [
  { mode: "light", icon: Sun },
  { mode: "dark", icon: Moon },
  { mode: "system", icon: Monitor },
  { mode: "sun", icon: SunMoon },
];

const SOUND_OPTIONS: { mode: SoundMode; icon: React.ComponentType<{ className?: string }> }[] = [
  { mode: "adhan", icon: AudioLines },
  { mode: "chime", icon: Bell },
  { mode: "vibrate", icon: Vibrate },
  { mode: "silent", icon: VolumeX },
];

function Section({ id, icon, title, description, children }: { id: string; icon: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="card-surface p-5">
      <div className="flex items-start gap-3">
        <IconCircle size="sm" tone="soft">
          {icon}
        </IconCircle>
        <div className="min-w-0">
          <h2 id={id} className="font-bold leading-tight">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChoiceButton({ pressed, onClick, children, className }: { pressed: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
        pressed ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-surface",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Notice({ tone = "info", children }: { tone?: "info" | "warning"; children: React.ReactNode }) {
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <p className={cn("flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm", tone === "warning" ? "bg-warning/10 text-foreground" : "bg-surface text-muted-foreground")}>
      <Icon className={cn("mt-0.5 size-4 shrink-0 stroke-[1.5]", tone === "warning" && "text-warning")} aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Panel Pengaturan App Jamaah (PRD-07b). Semua preferensi tersimpan di perangkat. */
export function SettingsPanel({ version }: { version: string }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const tpwa = useTranslations("pwa");
  const tprayer = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const push = usePushSubscription();
  const standalone = useStandalone();
  const qiblaRaw = useLocalValue(QIBLA_LOCATION_KEY);
  const qiblaMode: QiblaLocationMode = qiblaRaw === "device" ? "device" : "mosque";
  const [locating, setLocating] = React.useState(false);
  const [clearOpen, setClearOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const arabicClass = useArabicSizeClass();
  const [sound, setSound] = useSoundSettings();
  const alert = useAdhanAlert();
  const previewing = alert.status === "playing" && alert.source === "preview";

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => router.replace(pathname, { locale: next }));
  };

  const enableNotifications = async () => {
    unlockAudio();
    const result = await push.enable();
    if (result === "granted") toast({ title: t("notifications.enabledToast"), tone: "success" });
    else if (result === "denied") toast({ title: tpwa("notifications.denied"), tone: "error" });
    else if (result === "unsupported") toast({ title: tpwa("notifications.unsupported"), tone: "error" });
    else toast({ title: t("notifications.errorToast"), tone: "error" });
  };

  const disableNotifications = async () => {
    await push.disable();
    toast({ title: t("notifications.disabledToast"), tone: "default" });
  };

  /** Uji rantai lengkap: notifikasi sistem lewat service worker + suara & banner di App. */
  const sendTest = async () => {
    unlockAudio();
    const title = t("notifications.testTitle");
    const body = t("notifications.testBody");
    triggerAlert({ title, body, tag: "acc-test", kind: "test" }, sound);
    const ok = await push.sendTest(title, body);
    toast(ok ? { title: t("notifications.testSent"), tone: "success" } : { title: t("notifications.testFailed"), tone: "error" });
  };

  const chooseSound = (mode: SoundMode) => {
    if (previewing) stopAlertSound();
    setSound({ ...sound, mode });
    if (mode === "adhan") warmAdhanCache();
  };

  const changeVolume = (value: number) => {
    const volume = Math.min(1, Math.max(0, value / 100));
    setSound({ ...sound, volume });
    setPlayingVolume(volume);
  };

  const togglePreview = () => {
    if (previewing) {
      stopAlertSound();
      return;
    }
    previewSound(sound, { title: t("sound.previewTitle"), body: "" });
  };

  const chooseQibla = (mode: QiblaLocationMode) => {
    if (mode === "mosque") {
      writeLocal(QIBLA_LOCATION_KEY, "mosque");
      return;
    }
    if (!("geolocation" in navigator)) {
      toast({ title: t("qibla.error"), tone: "error" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocating(false);
        writeLocal(QIBLA_LOCATION_KEY, "device");
      },
      () => {
        setLocating(false);
        writeLocal(QIBLA_LOCATION_KEY, "mosque");
        toast({ title: t("qibla.error"), tone: "error" });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  };

  const clearData = async () => {
    if (push.subscribed) await push.disable().catch(() => undefined);
    clearSiteStorage();
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // abaikan
    }
    setTheme("system");
    setClearOpen(false);
    toast({ title: t("data.cleared"), tone: "success" });
  };

  const permissionLabel = t(`notifications.status.${push.permission}`);

  return (
    <div className="space-y-4">
      <Section id="settings-language" icon={<Languages />} title={t("language.title")} description={t("language.description")}>
        <div role="group" aria-label={t("language.title")} className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
          {LOCALES.map((l) => (
            <ChoiceButton key={l} pressed={l === locale} onClick={() => switchLocale(l)} className="justify-center text-center">
              <span lang={l}>{localeNames[l]}</span>
            </ChoiceButton>
          ))}
        </div>
        {isPending && <p className="mt-2 text-xs text-muted-foreground">{tc("actions.loading")}</p>}
      </Section>

      <Section id="settings-theme" icon={<SunMoon />} title={tc("theme.label")} description={t("theme.description")}>
        <div role="group" aria-label={tc("theme.label")} className="grid grid-cols-2 gap-2">
          {THEMES.map(({ mode, icon: Icon }) => (
            <ChoiceButton key={mode} pressed={theme === mode} onClick={() => setTheme(mode)}>
              <Icon aria-hidden />
              <span>{tc(`theme.${mode}`)}</span>
            </ChoiceButton>
          ))}
        </div>
        {theme === "sun" && <p className="mt-2 text-xs text-muted-foreground">{tc("theme.sunHint")}</p>}
      </Section>

      <Section id="settings-notifications" icon={<Bell />} title={tpwa("notifications.title")} description={tpwa("notifications.body")}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("notifications.statusLabel")}</span>
            <Badge variant={push.permission === "granted" ? "success" : push.permission === "denied" ? "destructive" : "outline"}>{permissionLabel}</Badge>
            {push.enabled && push.subscribed && <Badge variant="soft">{t("notifications.serverActive")}</Badge>}
          </div>

          {push.permission === "unsupported" && <Notice tone="warning">{tpwa("notifications.unsupported")}</Notice>}
          {push.permission === "denied" && <Notice tone="warning">{tpwa("notifications.denied")}</Notice>}
          {!push.vapidConfigured && push.permission !== "unsupported" && <Notice>{t("notifications.noVapid")}</Notice>}

          {push.permission !== "unsupported" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              {push.enabled ? (
                <Button variant="outline" onClick={disableNotifications} disabled={push.busy} className="flex-1">
                  <BellOff aria-hidden />
                  {t("notifications.disable")}
                </Button>
              ) : (
                <Button onClick={enableNotifications} disabled={push.busy || push.permission === "denied"} className="flex-1">
                  <BellRing aria-hidden />
                  {tpwa("notifications.enable")}
                </Button>
              )}
              <Button variant="soft" onClick={sendTest} disabled={push.permission !== "granted"} className="flex-1">
                <Send aria-hidden />
                {tpwa("notifications.test")}
              </Button>
            </div>
          )}

          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <h3 className="text-sm font-bold">{t("sound.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("sound.description")}</p>
            </div>
            <div role="group" aria-label={t("sound.title")} className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              {SOUND_OPTIONS.map(({ mode, icon: Icon }) => (
                <ChoiceButton key={mode} pressed={sound.mode === mode} onClick={() => chooseSound(mode)}>
                  <Icon aria-hidden />
                  <span className="min-w-0">
                    <span className="block">{t(`sound.modes.${mode}`)}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{t(`sound.hints.${mode}`)}</span>
                  </span>
                </ChoiceButton>
              ))}
            </div>
            <div className={cn("space-y-1.5", (sound.mode === "silent" || sound.mode === "vibrate") && "opacity-50")}>
              <label htmlFor="adhan-volume" className="flex items-center justify-between text-sm font-semibold">
                {t("sound.volume")}
                <span className="text-xs font-normal text-muted-foreground tabular">{Math.round(sound.volume * 100)}%</span>
              </label>
              <div className="flex items-center gap-3">
                <Volume1 className="size-4 shrink-0 stroke-[1.5] text-muted-foreground" aria-hidden />
                <input
                  id="adhan-volume"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(sound.volume * 100)}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  disabled={sound.mode === "silent" || sound.mode === "vibrate"}
                  className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
                />
                <Volume2 className="size-4 shrink-0 stroke-[1.5] text-muted-foreground" aria-hidden />
              </div>
              <p className="text-xs text-muted-foreground">{t("sound.volumeHint")}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={togglePreview} disabled={sound.mode === "silent"} aria-pressed={previewing}>
              {previewing ? <Square aria-hidden /> : <Play aria-hidden />}
              {previewing ? t("sound.stop") : sound.mode === "adhan" ? t("sound.previewAdhan") : t("sound.preview")}
            </Button>
            <Notice>{t("sound.foregroundNote")}</Notice>
            <Notice tone="warning">{t("sound.backgroundNote")}</Notice>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("sound.credit")}{" "}
              <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                CC BY 3.0
              </a>
            </p>
          </div>

          <div className={cn("divide-y divide-border", !push.enabled && "opacity-60")}>
            <p className="pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("notifications.prayers")}</p>
            {OBLIGATORY_PRAYERS.map((p: ObligatoryPrayer) => (
              <SwitchRow key={p} id={`notify-${p}`} label={tprayer(`names.${p}`)} checked={push.preferences[p]} onCheckedChange={(v) => push.setPreference(p, v)} />
            ))}
            <SwitchRow id="notify-iqamah" label={t("notifications.iqamah")} description={t("notifications.iqamahHint")} checked={push.preferences.iqamahReminder} onCheckedChange={(v) => push.setPreference("iqamahReminder", v)} />
            <SwitchRow id="notify-jumuah" label={t("notifications.jumuah")} description={t("notifications.jumuahHint")} checked={push.preferences.jumuah} onCheckedChange={(v) => push.setPreference("jumuah", v)} />
          </div>
          <p className="text-xs text-muted-foreground">{t("notifications.localHint")}</p>
        </div>
      </Section>

      <Section id="settings-qibla" icon={<LocateFixed />} title={t("qibla.title")} description={t("qibla.description")}>
        <div role="group" aria-label={t("qibla.title")} className="grid gap-2">
          <ChoiceButton pressed={qiblaMode === "device"} onClick={() => chooseQibla("device")}>
            <LocateFixed aria-hidden />
            <span className="min-w-0">
              <span className="block">{t("qibla.device")}</span>
              <span className="block text-xs font-normal text-muted-foreground">{locating ? tc("actions.loading") : t("qibla.deviceHint")}</span>
            </span>
          </ChoiceButton>
          <ChoiceButton pressed={qiblaMode === "mosque"} onClick={() => chooseQibla("mosque")}>
            <Landmark aria-hidden />
            <span className="min-w-0">
              <span className="block">{t("qibla.mosque")}</span>
              <span className="block text-xs font-normal text-muted-foreground">{t("qibla.mosqueHint")}</span>
            </span>
          </ChoiceButton>
        </div>
      </Section>

      <Section id="settings-arabic" icon={<Type />} title={t("arabic.title")} description={t("arabic.description")}>
        <ArabicSizeControl labels={{ label: t("arabic.title"), sm: t("arabic.sm"), md: t("arabic.md"), lg: t("arabic.lg") }} />
        <p lang="ar" dir="rtl" className={cn("mt-4 rounded-xl bg-surface px-4 py-3 text-center font-arabic", arabicClass)}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </Section>

      <Section id="settings-install" icon={<Smartphone />} title={t("install.title")} description={t("install.description")}>
        {standalone ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CircleCheck className="size-4 stroke-[1.5]" aria-hidden />
            {tpwa("installed")}
          </p>
        ) : (
          <div className="space-y-4">
            <InstallButton className="w-full" />
            <div>
              <h3 className="text-sm font-bold">{tpwa("iosTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tpwa("iosSteps")}</p>
              <IosSteps className="mt-2" />
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-bold">{tpwa("androidTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tpwa("androidSteps")}</p>
            </div>
          </div>
        )}
      </Section>

      <Section id="settings-data" icon={<HardDrive />} title={t("data.title")} description={t("data.description")}>
        <Dialog open={clearOpen} onOpenChange={setClearOpen}>
          <Button variant="outline" className="w-full" onClick={() => setClearOpen(true)}>
            {t("data.clear")}
          </Button>
          <DialogContent closeLabel={tc("actions.close")}>
            <DialogHeader>
              <DialogTitle>{t("data.confirmTitle")}</DialogTitle>
              <DialogDescription>{t("data.confirmBody")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">{tc("actions.cancel")}</Button>
              </DialogClose>
              <Button variant="destructive" onClick={clearData}>
                {t("data.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section id="settings-about" icon={<Info />} title={t("about.title")}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{t("about.version")}</dt>
          <dd className="font-semibold tabular">{version}</dd>
          <dt className="text-muted-foreground">{t("about.language")}</dt>
          <dd className="font-semibold">{localeNames[locale]}</dd>
        </dl>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
          <Link href="/privacy" className="text-brand hover:underline">
            {t("about.privacy")}
          </Link>
          <Link href="/" className="text-brand hover:underline">
            {t("about.website")}
          </Link>
        </div>
      </Section>
    </div>
  );
}
