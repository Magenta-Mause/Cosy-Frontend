import { Button } from "@components/ui/button.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetFooter } from "@/api/generated/backend-api.ts";
import { UserEntityDtoRole } from "@/api/generated/model";
import { useRequireRoles } from "@/utils/routeGuards";
import EditFooterModal from "./EditFooterModal";

interface FooterProps {
  bgImageFooter: string;
}

const Footer = ({ bgImageFooter }: FooterProps) => {
  const { t } = useTranslation();
  const { data: footerData, isLoading } = useGetFooter();
  const isOwner = useRequireRoles([UserEntityDtoRole.OWNER]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <div className="relative w-full">
      <img
        src={bgImageFooter}
        alt="BG Bottom"
        className="w-full h-auto block"
        style={{ imageRendering: "pixelated" }}
      />

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-8 text-[#87FF97]">
        {/* Left side - Title and Description */}
        <div className="flex-1 text-left">
          <h3 className="font-bold mb-4" style={{ color: "#87FF97" }}>
            {t("footer.title")}
          </h3>
          <p className="text-sm max-w-md">{t("footer.description")}</p>
        </div>

        {/* Right side - Imprint */}
        <div className="flex-1 text-right">
          <div className="flex items-start justify-end gap-2">
            <div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "#87FF97" }}>
                {t("footer.imprint")}
              </h3>
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
