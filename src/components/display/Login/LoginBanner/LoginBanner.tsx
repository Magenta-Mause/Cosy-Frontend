import { Button } from "@components/ui/button";
import { useTranslation } from "react-i18next";
import papyrusScroll from "@/assets/MainPage/PapyrusBanner.webp"

const LoginBanner = (props: { setOpen: (open: boolean) => void }) => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed bottom-20 content-center"
      tabIndex={-1}
      style={{
        backgroundImage: `url(${papyrusScroll})`,
        backgroundSize: "100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        imageRendering: "pixelated",
        height: "7rem",
        width: "35rem",
      }}
    >
      <div className="flex items-center justify-center gap-7 pt-5">
        <p className="text-xl">{t("signIn.question")}</p>
        <Button className="h-15" onClick={() => props.setOpen(true)}>
          {t("signIn.signIn")}
        </Button>
      </div>
    </div>
  );
};

export default LoginBanner;
