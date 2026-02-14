import { Button } from "@components/ui/button.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover.tsx";
import { useTranslation } from "react-i18next";
import globe from "@/assets/icons/globe.svg";
import { cn } from "@/lib/utils.ts";

const LANGUAGES = [
  {
    label: "English",
    value: "en",
  },
  {
    label: "Deutsch",
    value: "de",
  },
];

const LanguageSelector = (props: { className?: string; onLanguageChange?: () => void }) => {
  const { t, i18n } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn("w-fit p-[.5vw] aspect-square", props.className)}
          aria-label={t("optionsBanner.languageSelector")}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <img src={globe} alt="Logout Icon" className="h-[2.5vw] p-1 w-[2.5vw] aspect-square" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className={
          "z-101 flex flex-col gap-[.5vw] p-[0.3vw] w-[9vw] h-auto justify-evenly border-2"
        }
      >
        {LANGUAGES.map((language) => (
          <Button
            key={language.value}
            className={"text-[1.1vw] h-[2vw] py-[0.4vw]"}
            onClick={(e) => {
              e.stopPropagation();
              i18n.changeLanguage(language.value);
              props.onLanguageChange?.();
            }}
          >
            {language.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
