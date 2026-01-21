import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { ArrowDownUp, Funnel, UserRoundPlus } from "lucide-react";
import { useMemo, useState } from "react";
import type { UserEntityDtoRole } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer";
import UserRow from "./UserRow";

const formatRole = (role: UserEntityDtoRole) => {
  if (role === "QUOTA_USER") return "Quota";
  if (role === "ADMIN") return "Admin";
  if (role === "OWNER") return "Owner";
};

const UserTable = () => {
  const users = useTypedSelector((state) => state.userSliceReducer.data);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserEntityDtoRole | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const term = searchTerm.toLowerCase();

    return users.filter((user) => {
      const nameMatch = user.username?.toLowerCase().includes(term);
      const roleMatch = selectedRole ? user.role === selectedRole : true;

      return nameMatch && roleMatch;
    });
  }, [users, searchTerm, selectedRole]);

  return (
    <div className="container text-base mx-auto py-20 flex flex-col gap-2 w-3/4">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row items-center gap-2">
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
            <DropdownMenuContent className="bg-background">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <ArrowDownUp className="size-6" />
                Sort
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
        <div>
          <Button>
            <UserRoundPlus className="size-6" />
            Invite
          </Button>
        </div>
      </div>
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user, index) => (
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
    </div>
  );
};

export default UserTable;
