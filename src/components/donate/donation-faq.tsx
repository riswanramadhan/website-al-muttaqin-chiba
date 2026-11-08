import type { Locale } from "@/lib/types";
import { getFaqs } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/** FAQ kategori donasi dalam Accordion (PRD-05 §7). Server Component. */
export async function DonationFaq({ locale }: { locale: Locale }) {
  const faqs = await getFaqs("donation");
  if (faqs.length === 0) return null;
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger>{pick(faq.question, locale)}</AccordionTrigger>
          <AccordionContent>{pick(faq.answer, locale)}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
