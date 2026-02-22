import { Button } from "@components/ui/button";
import { useTranslation } from "react-i18next";
import papyrusScroll from "@/assets/MainPage/PapyrusBanner.webp"

const LoginBanner = (props: { setOpen: (open: boolean) => void }) => {
  const { t } = useTranslation();

  return (
    <div
      className={"fixed bottom-20"}
      tabIndex={-1}
      style={{
        backgroundImage: `url(${papyrusScroll})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "35vw",
        height: "8vw",
        imageRendering: "pixelated",
      }}
    >
      <div className="flex flex-start w-[65%] mt-[2.7vw] ml-[6vw] items-center justify-between">
        <p className="text-[2.5vw]">{t("signIn.question")}</p>
        <Button className="h-[4vw]" onClick={() => props.setOpen(true)}>
          {t("signIn.signIn")}
        </Button>
      </div>
    </div>
  );
};

export default LoginBanner;
