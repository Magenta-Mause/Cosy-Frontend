import { useTranslation } from "react-i18next";
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
}) => {
  const { t } = useTranslation();

  return (
    <form
      id="login-form"
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
        <Input type="text" id="username" name="username" header={t("signIn.username")} required />

        <Input
          type="password"
          id="password"
          name="password"
          header={t("signIn.password")}
          error={props.error}
          required
        />
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
