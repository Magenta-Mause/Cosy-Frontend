import { Button } from "@components/ui/button";
import { DropdownMenu } from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ArrowDownUp, Funnel, UserRoundPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTypedSelector } from "@/stores/rootReducer";
import UserRow from "./UserRow";

const UserTable = () => {
  const users = useTypedSelector((state) => state.userSliceReducer.data);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const term = searchTerm.toLowerCase();

    return users.filter((user) => {
      const nameMatch = user.username?.toLowerCase().includes(term);

      return nameMatch;
    });
  }, [users, searchTerm]);

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
                <Funnel className="size-6" /> Filter
              </Button>
            </DropdownMenuTrigger>
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
            user={user}
            key={user.uuid || index}
            userName={user.username ?? "Unknown"}
            userRole={user.role ?? "QUOTA_USER"}
          />
        ))
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          No users found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default UserTable;
