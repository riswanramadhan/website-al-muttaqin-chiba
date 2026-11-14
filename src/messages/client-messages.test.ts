import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NAMESPACES, SERVER_ONLY_NAMESPACES, clientMessages } from "@/messages";

/**
 * Hanya namespace yang dipakai `useTranslations` dikirim ke browser. Tes ini memindai kode sumber
 * agar namespace yang dipakai komponen browser tidak pernah masuk daftar "hanya server"
 * (yang akan membuat teksnya tampil sebagai kunci mentah).
 */
const SRC = join(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "admin" || name === "messages" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [full] : [];
  });
}

const files = sourceFiles(SRC).map((file) => ({ file: file.slice(SRC.length + 1).replace(/\\/g, "/"), text: readFileSync(file, "utf8") }));
const serverOnly = new Set<string>(SERVER_ONLY_NAMESPACES);

describe("pesan untuk browser", () => {
  it("daftar hanya-server berisi namespace yang terdaftar", () => {
    for (const namespace of SERVER_ONLY_NAMESPACES) expect(NAMESPACES).toContain(namespace);
  });

  it("tidak ada useTranslations yang memakai namespace hanya-server", () => {
    const offenders: string[] = [];
    for (const { file, text } of files) {
      for (const match of text.matchAll(/useTranslations\(\s*["'`]([a-zA-Z]+)/g)) {
        if (serverOnly.has(match[1])) offenders.push(`${file}: useTranslations("${match[1]}")`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("useTranslations selalu memakai namespace literal (bukan variabel)", () => {
    const offenders: string[] = [];
    for (const { file, text } of files) {
      for (const match of text.matchAll(/useTranslations\(\s*([^"'`)\s][^)]*)\)/g)) offenders.push(`${file}: useTranslations(${match[1]})`);
    }
    expect(offenders).toEqual([]);
  });

  it("kunci pesan kesalahan di skema formulir tidak menunjuk namespace hanya-server", () => {
    const offenders: string[] = [];
    for (const { file, text } of files) {
      if (!/schema/i.test(file)) continue;
      for (const match of text.matchAll(/["']([a-zA-Z]+)\.[a-zA-Z]+\.[a-zA-Z.]+["']/g)) {
        if (serverOnly.has(match[1])) offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("clientMessages membuang namespace hanya-server dan mempertahankan sisanya", () => {
    const all = Object.fromEntries(NAMESPACES.map((namespace) => [namespace, { key: namespace }]));
    const trimmed = clientMessages(all);
    expect(Object.keys(trimmed).sort()).toEqual(NAMESPACES.filter((namespace) => !serverOnly.has(namespace)).sort());
    expect(trimmed.common).toEqual({ key: "common" });
    expect(trimmed.admin).toBeUndefined();
  });
});
