import { Button } from "@components/ui/button.tsx";
import { useRouter } from "@tanstack/react-router";
import { ArrowBigRight } from "lucide-react";


const UserDetailButton = (props: { className?: string }) => {
  const router = useRouter();


  return (
    <Button
      onClick={() => {
        router.navigate({
          to: '/users',
        });
      }}
    >
      Marktplatz <ArrowBigRight />
    </Button>
  );
};

export default UserDetailButton;
