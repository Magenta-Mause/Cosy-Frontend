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

      <div
        className="absolute top-[14vw] left-0 right-0 flex items-center justify-between px-[2vw] z-20"
        style={{ gap: "2vw" }}
      >
        {/* Left side - Title and Description */}
        <div className="flex-1 text-left" style={{ fontSize: "1vw", color: "#87FF97" }}>
          <h3
            className="font-bold"
            style={{ color: "#87FF97", fontSize: "1vw", marginBottom: "1vw" }}
          >
            {t("footer.title")}
          </h3>
          <p style={{ maxWidth: "30vw", lineHeight: "1" }}>{t("footer.description")}</p>
        </div>

        {/* Right side - Imprint */}
        <div className="flex-1 text-right">
          <div className="flex items-start justify-end" style={{ gap: "1vw" }}>
            {isOwner && (
              <TooltipWrapper tooltip={t("footer.edit")}>
                <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
            )}
            <div style={{ fontSize: "1vw", color: "#87FF97" }}>
              {isLoading ? (
                <p>{t("common.loading")}</p>
              ) : footerData ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto",
                    gap: "0.5vw 2vw",
                    justifyContent: "end",
                  }}
                >
                  <p className="font-bold" style={{ textAlign: "right" }}>
                    {t("footer.contact")}
                  </p>
                  <p style={{ textAlign: "left" }}>{footerData.full_name}</p>
                  <p style={{ textAlign: "right" }}>{footerData.email}</p>
                  <p style={{ textAlign: "left" }}>{footerData.street}</p>
                  <p style={{ textAlign: "right" }}>{footerData.phone}</p>
                  <p style={{ textAlign: "left" }}>{footerData.city}</p>
                </div>
              ) : (
                <p>{t("footer.noData")}</p>
              )}
            </div>
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
