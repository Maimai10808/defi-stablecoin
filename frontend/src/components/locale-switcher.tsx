"use client";

import {Check, Languages} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

const locales = [
  {
    value: "en",
    label: "English",
    shortLabel: "EN",
    description: "Use English interface"
  },
  {
    value: "zh",
    label: "中文",
    shortLabel: "中",
    description: "使用中文界面"
  }
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: string) {
    const segments = pathname.split("/");

    if (segments[1] === "en" || segments[1] === "zh") {
      segments[1] = nextLocale;
    } else {
      segments.splice(1, 0, nextLocale);
    }

    router.push(segments.join("/") || `/${nextLocale}`);
  }

  const currentLocale = locales.find((item) => item.value === locale);
  const nextLocale = locale === "zh" ? "en" : "zh";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10 gap-2 rounded-full px-4 shadow-sm"
          aria-label={
            nextLocale === "zh"
              ? t("switchToChinese")
              : t("switchToEnglish")
          }
        >
          <Languages className="size-4" />
          <span className="text-sm font-medium">
            {currentLocale?.shortLabel ?? locale.toUpperCase()}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[320px] sm:w-95">
        <SheetHeader className="space-y-2">
          <SheetTitle className="flex items-center gap-2">
            <Languages className="size-5" />
            {t("language")}
          </SheetTitle>
          <SheetDescription>
            {t("languageDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-3">
          {locales.map((item) => {
            const isActive = item.value === locale;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => switchLocale(item.value)}
                className={[
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left transition",
                  "hover:bg-muted",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "flex size-10 items-center justify-center rounded-full border text-sm font-semibold",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted"
                    ].join(" ")}
                  >
                    {item.shortLabel}
                  </div>

                  <div>
                    <div className="text-sm font-medium">
                      {item.label}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>

                {isActive ? (
                  <Check className="size-4 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
