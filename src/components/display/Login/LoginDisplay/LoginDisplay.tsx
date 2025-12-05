import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLoginMutationOptions, login } from "@/api/generated/backend-api";
import type { LoginDto } from "@/api/generated/model";
import LoginBanner from "../LoginBanner/LoginBanner";
import LoginForm from "../LoginDialog/LoginForm";

const LoginDisplay = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    ...getLoginMutationOptions(),
    onSuccess: (token) => {
      localStorage.setItem("authToken", token);
      setOpen(false);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || t("signIn.loginFailed");
        setError(errorMessage);
      } else {
        setError(t("signIn.loginFailed"));
      }
    },
  });

  const handleLogin = async (formValues: { username: string; password: string }) => {
    loginMutation.mutate({ data: formValues });
  };

  return (
    <div>
      <div className="w-full flex justify-center absolute bottom-10 right-10">
        <LoginBanner setOpen={setOpen} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-primary-modal-background text- w-100">
          <DialogTitle className="text-3xl">{t("signIn.signIn")}</DialogTitle>
          <DialogDescription className="text-lg -my-5">{t("signIn.desc")}</DialogDescription>
          <LoginForm loginCallback={handleLogin} isPending={isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginDisplay;
