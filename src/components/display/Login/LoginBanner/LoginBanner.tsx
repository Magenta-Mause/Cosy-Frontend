import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { useTranslation } from "react-i18next";

const LoginBanner = (props: { setOpen: (open: boolean) => void }) => {
  const { t } = useTranslation();

  return (
    <Card className="flex fixed bottom-10 flex-row items-center gap-8 text-xl p-2 rounded-md px-6">
      <p>{t("signIn.question")}</p>
      <Button className="h-[80%]" onClick={() => props.setOpen(true)}>
        {t("signIn.signIn")}
      </Button>
    </Card>
  );
};

export default LoginBanner;
