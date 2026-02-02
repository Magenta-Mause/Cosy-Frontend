import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const LoginForm = (props: {
  loginCallback: (formValues: { username: string; password: string }) => void;
  error: string | null;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={(event: React.FormEvent<SignInElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = {
          username: form.elements.username.value,
          password: form.elements.password.value,
        };
        props.loginCallback(data);
      }}
    >
      <FieldGroup>
        <Input
          type="text"
          id="username"
          name="username"
          header={t("signIn.username")}
          required
        />

        <Input
          type="password"
          id="password"
          name="password"
          header={t("signIn.password")}
          error={props.error}
          required
        />

        <a href="#test" className="underline flex justify-end text-link text-lg -my-4">
          {t("signIn.resetPassword")}
        </a>

        <Button type="submit" disabled={props.isLoading} className="w-full">
          {props.isLoading ? t("signIn.loading") : t("signIn.signIn")}
        </Button>

        <p className="text-button-accent leading-none text-lg -mt-5 -mb-2">
          {t("signIn.continueMeansAccept")}{" "}
          <a href="#test" className="underline text-link">
            {t("signIn.legal")}
          </a>
        </p>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
