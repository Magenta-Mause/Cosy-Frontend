import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserEntityDtoRole } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer";
import UserInviteButton from "../UserInvite/UserInviteButton";
import PendingInvites from "./PendingInvites";
import RoleFilter from "./RoleFilter";
import SortDropdown, { type SortField } from "./SortDropdown";
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
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [isAsc, setIsAsc] = useState(true);

  const processedUsers = useMemo(() => {
    if (!users) return [];

    const term = searchTerm.toLowerCase();

    const filterResult = users.filter((user) => {
      const nameMatch = user.username?.toLowerCase().includes(term);
      const roleMatch = selectedRole ? user.role === selectedRole : true;
      return nameMatch && roleMatch;
    });

    return [...filterResult].sort((a, b) => {
      if (sortField) {
        const valueA = a[sortField];
        const valueB = b[sortField];

        if (typeof valueA === "number" || typeof valueB === "number" || valueA === null || valueB === null) {
          const numA = valueA === null ? Number.POSITIVE_INFINITY : (valueA as number);
          const numB = valueB === null ? Number.POSITIVE_INFINITY : (valueB as number);

          return isAsc ? numA - numB : numB - numA;
        }

        const strA = String(valueA ?? "").toLowerCase();
        const strB = String(valueB ?? "").toLowerCase();
        return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      const roleOrder: Record<UserEntityDtoRole, number> = {
        OWNER: 1,
        ADMIN: 2,
        QUOTA_USER: 3,
      };

      const roleA = roleOrder[a.role ?? "QUOTA_USER"];
      const roleB = roleOrder[b.role ?? "QUOTA_USER"];

      return roleA - roleB;
    });
  }, [users, searchTerm, selectedRole, sortField, isAsc]);

  return (
    <div className="container text-base mx-auto py-20 flex flex-col gap-2 w-3/4">
      <div className="flex flex-row gap-3 justify-between items-center w-full">
        <div className="flex flex-row items-center gap-3">
          <Input
            className="h-10 border-2"
            placeholder={t("components.userManagement.userTable.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />
          <SortDropdown
            sortField={sortField}
            isAscending={isAsc}
            onSortFieldChange={setSortField}
            onSortDirectionToggle={() => setIsAsc(!isAsc)}
          />
        </div>
        <UserInviteButton />
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
          {t("components.userManagement.userTable.noUsersFound")}{" "}
          {selectedRole
            ? `for role ${t(`components.userManagement.userRow.roles.${selectedRole.toLowerCase()}`)}`
            : ""}
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
