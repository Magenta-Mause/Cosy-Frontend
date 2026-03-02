import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetFooter } from "@/api/generated/backend-api.ts";
import { UserEntityDtoRole } from "@/api/generated/model";
import duckAlex from "@/assets/ducks/duck_Alex.png";
import duckAnni from "@/assets/ducks/duck_Anni.png";
import duckFiete from "@/assets/ducks/duck_Fiete.png";
import duckJanne from "@/assets/ducks/duck_Janne.png";
import duckJoon from "@/assets/ducks/duck_Joon.png";
import duckLars from "@/assets/ducks/duck_Lars.png";
import duckLeni from "@/assets/ducks/duck_Leni.png";
import duckLore from "@/assets/ducks/duck_Lore.png";
import duckSimon from "@/assets/ducks/duck_Simon.png";
import { useRequireRoles } from "@/utils/routeGuards";
import EditFooterModal from "./EditFooterModal";

interface FooterProps {
  bgImageFooter: string;
}

const allDucks = [
  { src: duckAlex, name: "EcoFreshKase", alt: "EcoFreshKase's GitHub Link", link: "https://github.com/EcoFreshKase", },
  { src: duckAnni, name: "Anni", alt: "Anni's LinkedIn Link", link: "https://de.linkedin.com/in/annika-schatter", site: "LinkedIn" },
  { src: duckFiete, name: "Fiete", alt: "Fietes GitHub Link", link: "https://github.com/fietensen" },
  { src: duckJanne, name: "Janne", alt: "Jannes GitHub Link", link: "https://github.com/Janne6565" },
  { src: duckJoon, name: "Joon", alt: "Joon's GitHub Link", link: "https://github.com/joonjester" },
  { src: duckLars, name: "Lars", alt: "Lars's GitHub Link", link: "https://github.com/Larsbobo" },
  { src: duckLeni, name: "LeeSoko", alt: "LeeSoko's GitHub Link", link: "https://github.com/LeeSoko" },
  { src: duckLore, name: "Lemuri", alt: "Lemuri's GitHub Link", link: "https://github.com/MCLemuri" },
  { src: duckSimon, name: "PyBay", alt: "PyBay's GitHub Link", link: "https://github.com//py-bay" },
];

const getDucks = () => {
  const shuffled = [...allDucks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
};

const Footer = ({ bgImageFooter }: FooterProps) => {
  const { t } = useTranslation();
  const { data: footerData, isLoading } = useGetFooter();
  const isOwner = useRequireRoles([UserEntityDtoRole.OWNER]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [duck1, duck2] = getDucks();

  return (
    <div className="relative w-full">
      <img
        src={bgImageFooter}
        alt="BG Bottom"
        className="w-full h-auto block"
        style={{ imageRendering: "pixelated" }}
      />

      <TooltipWrapper tooltip={`${t("footer.duckTooltip")} ${duck1.name}'s ${duck1.site ? duck1.site : "GitHub"}!`}>
        <a href={duck1.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-[12.5vw] left-[43vw] w-[5vw] h-auto z-30"
        >
          <img
            src={duck1.src}
            alt={duck1.alt}
            className="w-full h-auto scale-x-[-1]"
            style={{ imageRendering: "pixelated" }}
          />
        </a>
      </TooltipWrapper>
      <TooltipWrapper tooltip={`${t("footer.duckTooltip")} ${duck2.name}'s ${duck2.site ? duck2.site : "GitHub"}!`}>

        <a href={duck2.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-[13vw] left-[51vw] w-[5vw] h-auto z-30"
        >
          <img
            src={duck2.src}
            alt={duck2.alt}
            className="w-full h-auto"
            style={{ imageRendering: "pixelated" }}
          />
        </a>
      </TooltipWrapper>

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
            <TooltipWrapper tooltip={isOwner ? t("footer.edit") : undefined}>
              {isOwner ? (
                <button
                  type="button"
                  style={{
                    fontSize: "1vw",
                    color: "#87FF97",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setEditModalOpen(true)}
                >
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
                      <p style={{ textAlign: "right" }}>{footerData.full_name}</p>
                      <p style={{ textAlign: "right" }}>{footerData.email}</p>
                      <p style={{ textAlign: "right" }}>{footerData.street}</p>
                      <p style={{ textAlign: "right" }}>{footerData.phone}</p>
                      <p style={{ textAlign: "right" }}>{footerData.city}</p>
                    </div>
                  ) : (
                    <p>{t("footer.noData")}</p>
                  )}
                </button>
              ) : (
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
                      <p style={{ textAlign: "right" }}>{footerData.full_name}</p>
                      <p style={{ textAlign: "right" }}>{footerData.email}</p>
                      <p style={{ textAlign: "right" }}>{footerData.street}</p>
                      <p style={{ textAlign: "right" }}>{footerData.phone}</p>
                      <p style={{ textAlign: "right" }}>{footerData.city}</p>
                    </div>
                  ) : (
                    <p>{t("footer.noData")}</p>
                  )}
                </div>
              )}
            </TooltipWrapper>
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
