import { CpuLimitInput } from "@components/display/CpuLimit/CpuLimitInput.tsx";
import { MemoryLimitInput } from "@components/display/MemoryLimit/MemoryLimitInput.tsx";
import { Badge } from "@components/ui/badge.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Input } from "@components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserEntityDtoRole } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer";

interface InviteFormProps {
  username: string;
  memory: string | null;
  cpu: number | null;
  userRole: UserEntityDtoRole;
  // New restriction fields
  allowGameServerCreation: boolean;
  mcRouterAllowAllDomains: boolean;
  mcRouterAllowedDomains: string[];
  onUsernameChange: (value: string) => void;
  onUserRoleChange: (value: UserEntityDtoRole) => void;
  onMemoryChange: (value: string | null) => void;
  onCpuChange: (value: number | null) => void;
  onAllowGameServerCreationChange: (value: boolean) => void;
  onMcRouterAllowAllDomainsChange: (value: boolean) => void;
  onMcRouterAllowedDomainsChange: (value: string[]) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isCreating: boolean;
  usernameError?: string | null;
  cpuError?: string | null;
  memoryError?: string | null;
}

export const InviteForm = ({
  username,
  userRole,
  memory,
  cpu,
  allowGameServerCreation,
  mcRouterAllowAllDomains,
  mcRouterAllowedDomains,
  onUsernameChange,
  onMemoryChange,
  onCpuChange,
  onSubmit,
  onUserRoleChange,
  onAllowGameServerCreationChange,
  onMcRouterAllowAllDomainsChange,
  onMcRouterAllowedDomainsChange,
  usernameError,
  cpuError,
  memoryError,
}: InviteFormProps) => {
  const { t } = useTranslation();

  // Get available domains from instance settings
  const mcRouterConfig = useTypedSelector(
    (state) => state.cosyInstanceSettingsSliceReducer.settings?.mc_router_configuration,
  );
  const isMcRouterEnabled = mcRouterConfig?.enabled ?? false;
  const availableDomains = mcRouterConfig?.domains ?? [];

  const handleRemoveDomain = (domain: string) => {
    onMcRouterAllowedDomainsChange(mcRouterAllowedDomains.filter((d) => d !== domain));
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="space-y-4">
        {/* Username and Role */}
        <div className="flex flex-row gap-5 justify-between">
          <div className="flex-1">
            <Input
              header={t("userModal.usernameLabel")}
              description={t("userModal.usernameDescription")}
              id="invite-username"
              placeholder={t("userModal.usernamePlaceholder")}
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmit();
                }
              }}
              error={usernameError}
            />
          </div>
          <div className="flex flex-col justify-start ">
            <Label className="font-bold text-sm pb-2 leading-5.5" htmlFor="invite-role">
              {t("userModal.roleLabel")}
            </Label>
            <Select defaultValue={userRole} onValueChange={onUserRoleChange}>
              <SelectTrigger id={"invite-role"} className="py-1 text-base w-23.75">
                <SelectValue placeholder={t("userModal.rolePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(UserEntityDtoRole)
                  .filter((role) => role !== UserEntityDtoRole.OWNER)
                  .map((role) => (
                    <SelectItem value={role} key={role}>
                      {t(`userRoles.${role}`)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hardware Limits */}
        <div className="flex justify-between gap-5">
          <div className="w-[45%]">
            <CpuLimitInput
              header={t("userModal.cpuLimit")}
              description={t("userModal.cpuDescription")}
              id="cpu-limit"
              placeholder={t("userModal.placeholder")}
              value={cpu}
              onChange={(val) => onCpuChange(val === "" ? null : Number(val))}
              className="no-spinner"
              error={cpuError || undefined}
            />
          </div>
          <div className="w-[50%]">
            <MemoryLimitInput
              id="memory-limit"
              header={t("userModal.memoryLimit")}
              description={t("userModal.memoryDescription")}
              placeholder={t("userModal.placeholder")}
              value={memory}
              onChange={(val) => onMemoryChange(val === "" ? null : val)}
              className="no-spinner"
              error={memoryError || undefined}
            />
          </div>
        </div>

        {/* User Restrictions Section */}
        <div className="border-t pt-4 space-y-4">
          <Label className="font-bold text-sm">{t("userRestrictions.title")}</Label>

          {/* Allow Game Server Creation */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="allow-game-server-creation"
              checked={allowGameServerCreation}
              onCheckedChange={(checked) => onAllowGameServerCreationChange(checked === true)}
            />
            <div>
              <Label htmlFor="allow-game-server-creation" className="text-sm">
                {t("userRestrictions.gameServerCreation.allowed")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("userRestrictions.gameServerCreation.allowedDescription")}
              </p>
            </div>
          </div>

          {/* MC-Router Domains (only show if mc-router is enabled) */}
          {isMcRouterEnabled && (
            <div className="space-y-3">
              {/* Allow All Domains */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="mc-router-allow-all"
                  checked={mcRouterAllowAllDomains}
                  onCheckedChange={(checked) => onMcRouterAllowAllDomainsChange(checked === true)}
                />
                <div>
                  <Label htmlFor="mc-router-allow-all" className="text-sm">
                    {t("userRestrictions.mcRouter.allowAllDomains")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("userRestrictions.mcRouter.allowAllDomainsDescription")}
                  </p>
                </div>
              </div>

              {/* Specific Domains (only show if not allowing all) */}
              {!mcRouterAllowAllDomains && (
                <div className="space-y-2 pl-6">
                  <Label className="text-sm">{t("userRestrictions.mcRouter.allowedDomains")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("userRestrictions.mcRouter.allowedDomainsDescription")}
                  </p>
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(domain) => {
                        if (domain && !mcRouterAllowedDomains.includes(domain)) {
                          onMcRouterAllowedDomainsChange([...mcRouterAllowedDomains, domain]);
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue
                          placeholder={t("userRestrictions.mcRouter.allowedDomainsPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDomains
                          .filter((d) => !mcRouterAllowedDomains.includes(d))
                          .map((domain) => (
                            <SelectItem value={domain} key={domain}>
                              {domain}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mcRouterAllowedDomains.map((domain) => (
                      <Badge key={domain} variant="secondary" className="gap-1">
                        {domain}
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="ml-1 hover:text-destructive"
                          aria-label={t("userRestrictions.mcRouter.removeDomain", { domain })}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
