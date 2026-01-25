import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow, Funnel } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserEntityDtoRole } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer";
import UserModalButton from "../UserInvite/UserModalButton";
import PendingInvites from "./PendingInvites";
import UserRow from "./UserRow";

interface UserListProps {
  onRevoke: (uuid: string) => void;
}

const UserTable = ({ onRevoke }: UserListProps) => {
  const users = useTypedSelector((state) => state.userSliceReducer.data);
  const invites = useTypedSelector((state) => state.userInviteSliceReducer.data);
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserEntityDtoRole | null>(null);
  const [sortField, setSortField] = useState<"username" | "role" | "max_cpu" | "max_memory" | null>(
    null,
  );
  const [isAsc, setIsAsc] = useState(true); // true = ASC, false = DESC

  const processedUsers = useMemo(() => {
    if (!users) return [];

    const term = searchTerm.toLowerCase();

    const filterResult = users.filter((user) => {
      const nameMatch = user.username?.toLowerCase().includes(term);
      const roleMatch = selectedRole ? user.role === selectedRole : true;
      return nameMatch && roleMatch;
    });

    if (!sortField) return filterResult;

    return [...filterResult].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];

      // Numerischer Check
      if (typeof valueA === "number" && typeof valueB === "number") {
        return isAsc ? valueA - valueB : valueB - valueA;
      }

      // String Check
      const strA = String(valueA ?? "").toLowerCase();
      const strB = String(valueB ?? "").toLowerCase();
      return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [users, searchTerm, selectedRole, sortField, isAsc]);

  return (
    <div className="container text-base mx-auto py-20 flex flex-col gap-2 w-3/4">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row items-center gap-3">
          <Input
            className="h-10 border-2"
            placeholder={t("components.userManagement.userTable.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Funnel className="size-6" />
                {selectedRole ? (
                  <span>
                    {selectedRole === "OWNER"
                      ? t("components.userManagement.userRow.roles.owner")
                      : selectedRole === "ADMIN"
                        ? t("components.userManagement.userRow.roles.admin")
                        : t("components.userManagement.userRow.roles.quota_user")}
                  </span>
                ) : (
                  t("components.userManagement.userTable.filter")
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSelectedRole("OWNER")}>{t("components.userManagement.userRow.roles.owner")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRole("ADMIN")}>{t("components.userManagement.userRow.roles.admin")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRole("QUOTA_USER")}>
                  {t("components.userManagement.userRow.roles.quota_user")}
                </DropdownMenuItem>
                {selectedRole && (
                  <>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setSelectedRole(null)}
                    >
                      {t("components.userManagement.userTable.resetFilter")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-row items-center gap-0.5">
            <Button disabled={!sortField} onClick={() => setIsAsc(!isAsc)}>
              {!sortField ? (
                <ArrowUpDown className="size-6" />
              ) : isAsc ? (
                <ArrowDownWideNarrow className="size-6" />
              ) : (
                <ArrowUpWideNarrow className="size-6" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  {sortField ? (
                    <span>
                      {sortField === "max_cpu"
                        ? t("components.userManagement.userTable.sortBy.cpuLimit")
                        : sortField === "max_memory"
                          ? t("components.userManagement.userTable.sortBy.memoryLimit")
                          : sortField === "username"
                            ? t("components.userManagement.userTable.sortBy.name")
                            : t("components.userManagement.userTable.sortBy.role")}
                    </span>
                  ) : (
                    t("components.userManagement.userTable.sort")
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortField("username")}>{t("components.userManagement.userTable.sortBy.name")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField("role")}>{t("components.userManagement.userTable.sortBy.role")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField("max_cpu")}>
                  {t("components.userManagement.userTable.sortBy.cpuLimit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField("max_memory")}>
                  {t("components.userManagement.userTable.sortBy.memoryLimit")}
                </DropdownMenuItem>

                {sortField && (
                  <>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setSortField(null)}
                    >
                      {t("components.userManagement.userTable.clearSort")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div>
          <UserModalButton />
        </div>
      </div>
      {processedUsers.length > 0 ? (
        processedUsers.map((user, index) => (
          <UserRow
            key={user.uuid || index}
            user={user}
            userName={user.username ?? "Unknown"}
            userRole={user.role ?? "QUOTA_USER"}
          />
        ))
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {t("components.userManagement.userTable.noUsersFound")} {selectedRole ? `for role ${t(`components.userManagement.userRow.roles.${selectedRole.toLowerCase()}`)}` : ""}
        </div>
      )}
      {users.length > 0 && invites.length > 0 && <Separator className="my-4 pb-0.5" />}

      {invites.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("userModal.pendingInvites")}
          </h4>
          {invites.map((invite, index) => (
            <PendingInvites onRevoke={onRevoke} invite={invite} key={invite.uuid || index} />
          ))}
        </>
      )}
    </div>
  );
};

export default UserTable;
