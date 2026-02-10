import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import type { GameServerDto, GameServerUpdateDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const UncosyZone = (props: {
  gameServer: GameServerDto;
}) => {
  const { t } = useTranslationPrefix("components.editGameServer.uncosyZone");

  return (
    <div>
      <h3 className="leading-7">{t("title")}</h3>
      <Card className="border-alarm my-5">
        <CardContent>
          <div className="flex justify-between py-2 gap-4 items-center">
            <div className="">
              <p className="text-base font-bold">{t("handOver.title")}</p>
              <p className="text-sm text-muted-foreground leading-7">{t("handOver.description")}</p>
            </div>
            <Button variant='destructive'>{t("handOver.button")}</Button>
          </div>
          <Separator />
          <div className="flex justify-between py-2 gap-4 items-center">
            <div className="">
              <p className="text-base font-bold">{t("delete.title")}</p>
              <p className="text-sm text-muted-foreground leading-7">{t("delete.description")}</p>
            </div>
            <Button variant='destructive'>{t("delete.button")}</Button>
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default UncosyZone;
