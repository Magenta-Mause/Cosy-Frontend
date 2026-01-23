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

const formatRole = (role: UserEntityDtoRole) => {
  if (role === "QUOTA_USER") return "Quota";
  if (role === "ADMIN") return "Admin";
  if (role === "OWNER") return "Owner";
};

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
            className="h-10"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Funnel className="size-6" />
                {selectedRole ? formatRole(selectedRole) : "Filter"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSelectedRole("OWNER")}>Owner</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRole("ADMIN")}>Admin</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRole("QUOTA_USER")}>
                  Quota
                </DropdownMenuItem>
                {selectedRole && (
                  <>
                    <div className="h-px bg-muted my-1" />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setSelectedRole(null)}
                    >
                      Reset Filter
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-row items-center gap-0.5">
            <Button className="" disabled={!sortField} onClick={() => setIsAsc(!isAsc)}>
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
                        ? "CPU Limit"
                        : sortField === "max_memory"
                          ? "Memory Limit"
                          : sortField === "username"
                            ? "Name"
                            : "Role"}
                    </span>
                  ) : (
                    "Sort"
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortField("username")}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField("role")}>Role</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField("max_cpu")}>
                  CPU Limit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField("max_memory")}>
                  Memory Limit
                </DropdownMenuItem>

                {sortField && (
                  <>
                    <div className="h-px bg-muted my-1" />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setSortField(null)}
                    >
                      Clear Sort
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
          No users found {selectedRole ? `for role ${formatRole(selectedRole)}` : ""}
        </div>
      )}
      {users.length > 0 && invites.length > 0 && <Separator className="my-4" />}

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
