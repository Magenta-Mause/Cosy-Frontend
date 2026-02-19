import SizeDropDown from "@components/display/DropDown/SizeDropDown";
import { COL_SPAN_MAP } from "@components/display/MetricDisplay/metricLayout";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { useBlocker } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { v7 as generateUuid } from "uuid";
import type { GameServerDto, MetricLayout, PrivateDashboardLayout } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice";
import { DashboardTypes } from "@/types/DashboardTypes";
import { LayoutSize } from "@/types/layoutSize";
import type { PrivateDashboardLayoutUI } from "@/types/privateDashboard";
import UnsavedModal from "./UnsavedModal";

interface GenericLayoutSelectionProps<T extends { _uiUuid: string; size?: LayoutSize }> {
  gameServer: GameServerDto;
  defaultAddNew: T;
  layoutSection: "private_dashboard_layouts" | "metric_layout" | "public_dashboard_layouts";
  isChanged: boolean;
  layouts: T[];
  unfulfilledChanges?: string | null;
  publicIsEnabled?: boolean;
  setUnfulfilledChanges?: (message: string | null) => void;
  saveHandler?: (uuid: string, layouts: PrivateDashboardLayout[] | MetricLayout[]) => void;
  setLayouts: React.Dispatch<React.SetStateAction<T[]>>;
  wrapper: (layouts: T[]) => T[];
  children?: (layout: T) => React.ReactNode;
}

export default function GenericLayoutSelection<T extends { _uiUuid: string; size?: LayoutSize }>(
  props: GenericLayoutSelectionProps<T>,
) {
  const {
    gameServer,
    isChanged,
    layouts,
    unfulfilledChanges,
    layoutSection,
    defaultAddNew,
    publicIsEnabled,
    setLayouts,
    setUnfulfilledChanges,
    children,
    saveHandler,
  } = props;
  const { t } = useTranslationPrefix("components");
  const dispatch = useDispatch();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [cardErrors, setCardErrors] = useState<Set<string>>(new Set());
  const resolverRef = useRef<((block: boolean) => void) | null>(null);

  const wrap = (layout: T): T => ({ ...layout, _uiUuid: generateUuid() });

  const wrapper = (layouts: T[]): T[] => layouts.map(wrap);

  const handleConfirm = () => {
    const updatedServer: GameServerDto = {
      ...gameServer,
      public_dashboard_enabled: publicIsEnabled,
      [layoutSection]: layouts.map(({ _uiUuid, ...layout }) => layout),
    };

    const errorUuids = layouts
      .filter((layout) => {
        const l = layout as PrivateDashboardLayoutUI;
        return (
          l.private_dashboard_types === DashboardTypes.FREETEXT &&
          (l.content === undefined ||
            l.content?.length === 0 ||
            l.content?.some((c) => !c.key || !c.value))
        );
      })
      .map((layout) => layout._uiUuid);

    if (errorUuids.length > 0) {
      setCardErrors(new Set(errorUuids));
      setUnfulfilledChanges?.(t("GameServerSettings.privateDashboard.freetext.error"));
      return;
    }

    setCardErrors(new Set());
    setUnfulfilledChanges?.(null);

    dispatch(gameServerSliceActions.updateGameServer(updatedServer));
    saveHandler?.(gameServer.uuid, updatedServer[layoutSection]);
  };

  const handleWidthSelect = (size: LayoutSize, uuid?: string) => {
    if (!uuid) return;

    setLayouts(
      layouts.map((layout) => (layout._uiUuid === uuid ? { ...layout, size: size } : layout)),
    );
  };

  const handleOnDelete = (uuid?: string) => {
    if (!uuid) return;

    setLayouts(layouts.filter((layout) => layout._uiUuid !== uuid));
    setCardErrors((prev) => {
      const next = new Set(prev);
      next.delete(uuid);
      return next;
    });
  };

  const handleOnAdd = () => {
    setLayouts([...layouts, { ...defaultAddNew, _uiUuid: generateUuid() }]);
  };

  useBlocker({
    shouldBlockFn: () => {
      if (!isChanged) return false;

      return new Promise<boolean>((resolve) => {
        resolverRef.current = (block) => {
          resolve(block);
        };

        setShowUnsavedModal(true);
      });
    },
    enableBeforeUnload: isChanged,
  });

  useEffect(() => { console.log(publicIsEnabled) }, [publicIsEnabled]);

  return (
    <>
      <div className={`flex w-full pt-3 ${!publicIsEnabled ? "pointer-events-none blur-xs " : ""}`}>
        <Card className={"w-full h-[65vh]"}>
          <CardContent className={"grid grid-cols-6 gap-4 overflow-scroll p-6"}>
            {layouts.map((layout) => (
              <Card
                key={layout._uiUuid}
                className={cn(
                  "relative border-2 border-primary-border rounded-md bg-background/80 w-full h-[16vh] justify-center",
                  COL_SPAN_MAP[layout.size ?? LayoutSize.MEDIUM],
                  cardErrors.has(layout._uiUuid) && "border-destructive bg-destructive/20",
                )}
              >
                <Button
                  variant={"destructive"}
                  className={
                    cn("flex justify-center items-center w-6 h-6 rounded-full absolute top-0 right-0 -mr-3 -mt-2", publicIsEnabled)
                  }
                  onClick={() => handleOnDelete(layout._uiUuid)}
                >
                  <X />
                </Button>
                <div className="flex gap-2 items-center justify-center overflow-x-scroll">
                  <div>
                    <span className="flex text-lg">{t("GameServerSettings.metrics.type")}</span>
                    <span className="flex text-lg">{t("GameServerSettings.metrics.width")}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {children?.(layout)}
                    <SizeDropDown
                      size={layout?.size ?? LayoutSize.MEDIUM}
                      uuid={layout._uiUuid}
                      handleWidthSelect={handleWidthSelect}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              onClick={handleOnAdd}
              variant="secondary"
              className="outline-dashed outline-button-primary-default border-none h-[16vh] col-span-3 flex items-center justify-center shadow-none bg-background/35"
            >
              <div className="flex items-center">
                <Plus className="-size-2" />
                {t("GameServerSettings.privateDashboard.add")}
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="fixed right-[10%] mt-3 w-fit ml-auto flex gap-4">
        <div className="flex items-center gap-2">
          {cardErrors.size > 0 && (
            <p className="text-base text-destructive">{unfulfilledChanges}</p>
          )}
          <Button
            className="h-12.5"
            variant="secondary"
            disabled={!isChanged}
            onClick={() => {
              setLayouts(
                wrapper(gameServer[layoutSection] ? (gameServer[layoutSection] as T[]) : []),
              );
              setCardErrors(new Set());
              setUnfulfilledChanges?.(null);
            }}
          >
            {t("editGameServer.revert")}
          </Button>
          <Button type="button" onClick={handleConfirm} className="h-12.5" disabled={!isChanged}>
            {t("editGameServer.confirm")}
          </Button>
        </div>
      </div>
      <UnsavedModal
        open={showUnsavedModal}
        setOpen={setShowUnsavedModal}
        onLeave={() => {
          setShowUnsavedModal(false);
          setLayouts(gameServer[layoutSection] ? wrapper(gameServer[layoutSection] as T[]) : []);
          resolverRef.current?.(false);
        }}
        onSaveAndLeave={() => {
          setShowUnsavedModal(false);
          resolverRef.current?.(false);
          handleConfirm();
        }}
        onStay={() => {
          setShowUnsavedModal(false);
          resolverRef.current?.(true);
        }}
      />
    </>
  );
}
