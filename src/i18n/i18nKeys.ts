export type i18nLanguage = {
  overviewPage: {
    createNewServer: string;
  };
  rightClickMenu: {
    edit: string;
    delete: string;
    refresh: string;
    createNewGameserver: string;
  };
  toasts: {
    notImplemented: string;
    deleteGameServerSuccess: string;
    deleteGameServerError: string;
    refreshGameServersSuccess: string;
    refreshGameServersError: string;
  };
  deleteGameServerDialog: {
    title: ContainsVariable<"serverName">;
    description: string;
    inputLabel: string;
    cancel: string;
    confirm: string;
  };
  aria: {
    createNewGameServer: string;
    gameServerConfiguration: ContainsVariable<"serverName">;
  };
  consequence: ContainsVariable<"counter">; // example
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
