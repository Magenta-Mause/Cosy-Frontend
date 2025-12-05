import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getLoginMutationOptions, useFetchToken } from "@/api/generated/backend-api";
import LoginBanner from "../LoginBanner/LoginBanner";
import LoginForm from "../LoginDialog/LoginForm";

const LoginDisplay = () => {
  const { t } = useTranslation();
  const [authorized, setAuthorized] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = localStorage.getItem("refreshToken");

  const loginMutation = useMutation({
    ...getLoginMutationOptions(),
    onSuccess: (token) => {
      localStorage.setItem("refreshToken", token);
      setOpen(false);
      setError(null);
      setAuthorized(true);
    },
    onError: () => {
      setError(t("signIn.incorrectCredentials"));
    },
  });

  const identityTokenMutation = useMutation({
    ...useFetchToken(),
    onSuccess: (token) => {
      localStorage.setItem("identityToken", token);
      setAuthorized(true);
      setOpen(false);
      setError(null);
    },
    onError: () => {
      setAuthorized(false);
    },
  });

  useEffect(() => {
    if (refreshToken) {
      identityTokenMutation.mutate();
    }
  }, [refreshToken, identityTokenMutation]);

  const handleLogin = async (formValues: { username: string; password: string }) => {
    loginMutation.mutate({ data: formValues });
  };

  return (
    !authorized && (
      <div>
        <div className="w-full flex justify-center absolute bottom-10 right-10">
          <LoginBanner setOpen={setOpen} />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-primary-modal-background text- w-100">
            <DialogTitle className="text-3xl">{t("signIn.signIn")}</DialogTitle>
            <DialogDescription className="text-lg -my-5">{t("signIn.desc")}</DialogDescription>
            <LoginForm loginCallback={handleLogin} error={error} />
          </DialogContent>
        </Dialog>
      </div>
    )
  );
};

export default LoginDisplay;
