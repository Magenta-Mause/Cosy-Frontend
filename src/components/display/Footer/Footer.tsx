import { Button } from "@components/ui/button.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetFooter } from "@/api/generated/backend-api.ts";
import { UserEntityDtoRole } from "@/api/generated/model";
import footer from "@/assets/MainPage/backgrounds/bg_day_bottom.png";
import castle from "@/assets/MainPage/castle.png";
import { useRequireRoles } from "@/utils/routeGuards";
import EditFooterModal from "./EditFooterModal";

const Footer = () => {
  const { t } = useTranslation();
  const { data: footerData, isLoading } = useGetFooter();
  const isOwner = useRequireRoles([UserEntityDtoRole.OWNER]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <div
      className="relative w-full min-h-[400px] flex items-center justify-between py-2"
      style={{
        backgroundImage: `url(${footer})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    >
      {/* Left side - Title and Description */}
      <div className="flex-1 text-left">
        <h2 className="text-3xl font-bold mb-4">{t("footer.title")}</h2>
        <p className="text-lg max-w-md">{t("footer.description")}</p>
      </div>

      {/* Center - Castle Image */}
      <div className="flex-1 flex justify-center">
        <img
          src={castle}
          alt="Castle"
          className="max-h-[300px] h-auto"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Right side - Imprint */}
      <div className="flex-1 text-right">
        <div className="flex items-start justify-end gap-2">
          <div>
            <h3 className="text-2xl font-semibold mb-4">{t("footer.imprint")}</h3>
            {isLoading ? (
              <p>{t("common.loading")}</p>
            ) : footerData ? (
              <div className="space-y-2">
                <p>{footerData.full_name}</p>
                <p>{footerData.email}</p>
                <p>{footerData.phone}</p>
                <p>{footerData.street}</p>
                <p>{footerData.city}</p>
              </div>
            ) : (
              <p>{t("footer.noData")}</p>
            )}
          </div>
          {isOwner && (
            <TooltipWrapper tooltip={t("footer.edit")}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="mt-1"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipWrapper>
          )}
        </div>
      </div>

      {isOwner && (
        <EditFooterModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          footerData={footerData}
        />
      )}
    </div>
  );
};

export default Footer;
