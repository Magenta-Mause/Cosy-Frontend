import { Button } from "@components/ui/button";
import { DropdownMenu } from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ArrowDownUp, Funnel, UserRoundPlus } from "lucide-react";
import { useTypedSelector } from "@/stores/rootReducer";
import UserRow from "./UserRow";

const UserTable = () => {
  const users = useTypedSelector((state) => state.userSliceReducer.data);

  return (
    <div className="container text-base mx-auto py-20 flex flex-col gap-2 px-40">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row items-center gap-2">
          <Input placeholder="Search" className="h-10" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Funnel className="size-5" /> Filter
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button><ArrowDownUp className="size-5" />Sort</Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
        <div>
          <Button><UserRoundPlus className="size-5" />Invite</Button>
        </div>
      </div>
      {users?.map((user, index) => (
        <UserRow
          user={user}
          key={user.uuid || index}
          userName={user.username ?? "Unknown"}
          userRole={user.role ?? "QUOTA_USER"}
        />
      ))}
    </div>
  );
};

export default UserTable;
