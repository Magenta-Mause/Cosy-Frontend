import SettingsActionButtons from "@components/display/GameServer/GameServerSettings/SettingsActionButtons.tsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { GameServerDesign } from "@/api/generated/model";
import castle from "@/assets/MainPage/castle.png";
import house from "@/assets/MainPage/house.png";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer.tsx";
import { cn } from "@/lib/utils.ts";

const DesignSettingsSection = () => {
  const { t } = useTranslation();
  const { updateGameServerDesign } = useDataInteractions();
  const { gameServer } = useSelectedGameServer();

  const [selectedDesign, setSelectedDesign] = useState<GameServerDesign>(
    gameServer.design ?? "HOUSE",
  );
  const [loading, setLoading] = useState(false);
  const hasChanges = selectedDesign !== (gameServer.design ?? "HOUSE");

  const handleSave = async () => {
    if (!gameServer.uuid) {
      toast.error(t("toasts.missingUuid"));
      return;
    }
    setLoading(true);
    try {
      await updateGameServerDesign(gameServer.uuid, selectedDesign);
    } finally {
      setLoading(false);
    }
  };

  const designs: { value: GameServerDesign; image: string; label: string }[] = [
    {
      value: "HOUSE",
      image: house,
      label: t("components.gameServerSettings.designSettings.house"),
    },
    {
      value: "CASTLE",
      image: castle,
      label: t("components.gameServerSettings.designSettings.castle"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">
          {t("components.gameServerSettings.designSettings.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("components.gameServerSettings.designSettings.description")}
        </p>
      </div>
      <div className="flex gap-6">
        {designs.map(({ value, image, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedDesign(value)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
              selectedDesign === value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50",
            )}
          >
            <img
              src={image}
              alt={label}
              className="w-32 h-32 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <SettingsActionButtons
        onRevert={() => setSelectedDesign(gameServer.design ?? "HOUSE")}
        onConfirm={handleSave}
        revertDisabled={loading || !hasChanges}
        confirmDisabled={loading || !hasChanges}
      />
    </div>
  );
};

export default DesignSettingsSection;
