import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import { LogOut } from "lucide-react";
import { useContext } from "react";
import { cn } from "@/lib/utils.ts";

const LogOutButton = () => {
  const { handleLogout } = useContext(AuthContext);

  return (
    <Button
      className={cn("h-auto p-[.5vw] aspect-square")}
      aria-label={"Select Language"}
      onClick={() => handleLogout()}
    >
      <LogOut className="!h-[1.5vw] p-0 !w-auto aspect-square" />
    </Button>
  );
};

export default LogOutButton;
