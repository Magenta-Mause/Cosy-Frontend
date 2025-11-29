export type i18nLanguage = {
  index: {
    clickCounter: string;
    clickBtn: string;
    dontClickBtn: string;
  };

  redirected: {
    warning: string;
    consequence: ContainsVariable<"counter">;
    noConsequence: string;
    earnMoreClicks: string;
  };
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
