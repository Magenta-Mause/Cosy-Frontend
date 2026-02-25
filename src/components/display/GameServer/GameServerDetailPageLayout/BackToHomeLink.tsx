import Link from "@components/ui/Link.tsx";
import { DoorClosedIcon, DoorOpenIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import FancyNavigationButton from "./FancyNavigationButton.tsx";

const iconStyles: CSSProperties = {
  scale: 1.8,
};

const BackToHomeLink = (props: { className?: string; variant?: "primary" | "secondary" }) => {
  const { t } = useTranslation();

  return (
    <Link to={"/"} tabIndex={-1} preload={"viewport"} className={cn(props.className)}>
      <FancyNavigationButton
        isActive={false}
        label={t("serverPage.back")}
        variant={props.variant}
        tabIndex={0}
        direction={"right"}
        className={"group"}
      >
        <DoorClosedIcon className={"group-hover:hidden group-focus:hidden"} style={iconStyles} />
        <DoorOpenIcon
          className={"hidden group-hover:inline-block group-focus:inline-block"}
          style={iconStyles}
        />
      </FancyNavigationButton>
    </Link>
  );
};

export default BackToHomeLink;
