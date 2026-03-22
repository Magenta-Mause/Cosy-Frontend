import { Button } from "@components/ui/button.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const PermissionsPage = ({
  user,
  onUnsavedChange,
}: {
  user: UserEntityDto;
  onUnsavedChange?: (dirty: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("userRestrictions");
  const { t: tModal } = useTranslationPrefix("userSettingsModal");
  const { updateUserRestrictions } = useDataInteractions();

  const [allowGameServerCreation, setAllowGameServerCreation] = useState(
    user.allow_game_server_creation ?? true,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setAllowGameServerCreation(user.allow_game_server_creation ?? true);
    setSubmitError(null);
  }, [user]);

  const hasChanges = allowGameServerCreation !== (user.allow_game_server_creation ?? true);

  useEffect(() => {
    onUnsavedChange?.(hasChanges);
  }, [hasChanges, onUnsavedChange]);

  const handleRevert = () => {
    setAllowGameServerCreation(user.allow_game_server_creation ?? true);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!user.uuid) return;

    setSubmitError(null);
    setIsPending(true);
    try {
      await updateUserRestrictions(user.uuid, {
        allow_game_server_creation: allowGameServerCreation,
      });
    } catch {
      setSubmitError(tModal("submitError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pt-8 pr-5 pl-2">
      <div className="space-y-6 grow min-h-full">
        <div>
          <h2 className="text-xl font-bold">{t("title")}</h2>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="permissions-allow-game-server-creation"
            className="mb-2.5"
            checked={allowGameServerCreation}
            onCheckedChange={(checked) => setAllowGameServerCreation(checked === true)}
          />
          <div>
            <Label htmlFor="permissions-allow-game-server-creation" className="text-sm">
              {t("gameServerCreation.allowed")}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("gameServerCreation.allowedDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto">
        {submitError && <p className="text-base text-destructive">{submitError}</p>}
        <Button variant="secondary" onClick={handleRevert} disabled={isPending || !hasChanges}>
          {tModal("revert")}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !hasChanges}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tModal("save")}
        </Button>
      </div>
    </div>
  );
};

export default PermissionsPage;
