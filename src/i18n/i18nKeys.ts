export type i18nLanguage = {
  overviewPage: {
    createNewServer: string;
  };
  rightClickMenu: {
    edit: string;
    delete: string;
    startServer: string;
    stopServer: string;
    refresh: string;
    createNewGameserver: string;
    viewLogs: string;
    loading: string;
    failed: string;
  };
  toasts: {
    notImplemented: string;
    deleteGameServerSuccess: string;
    deleteGameServerError: string;
    refreshGameServersSuccess: string;
    refreshGameServersError: string;
    inviteCreatedSuccess: string;
    inviteCreateError: ContainsVariable<"error">;
    inviteRevokedSuccess: string;
    inviteRevokeError: string;
    copyClipboardSuccess: string;
    passwordsDoNotMatch: string;
    usernameRequired: string;
    accountCreatedSuccess: string;
    accountCreateError: ContainsVariable<"error">;
    createGameServerSuccess: string;
    serverStartSuccess: string;
    serverStartError: ContainsVariable<"error">;
    serverStopSuccess: string;
    serverStopError: ContainsVariable<"error">;
    updateGameServerSuccess: string;
    updateGameServerError: string;
    missingUuid: string;
  };
  userModal: {
    title: string;
    inviteUserTitle: string;
    inviteCreatedTitle: string;
    inviteBtn: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    usernameDescription: string;
    cancel: string;
    generateInvite: string;
    creating: string;
    shareInstructions: string;
    copyLink: string;
    backToUsers: string;
    pendingInvites: string;
    unclaimedInvite: string;
    created: ContainsVariable<"date">;
    revokeTooltip: string;
    copyTooltip: string;
    roleLabel: string;
    editTooltip: string;
    memoryLimit: string;
    memoryDescription: string;
    cpuLimit: string;
    cpuDescription: string;
    placeholder: string;
  };
  userRoles: {
    QUOTA_USER: string;
    ADMIN: string;
    OWNER: string;
  };
  inviteRedemption: {
    title: string;
    description: string;
    invalidLink: string;
    close: string;
    invitedBy: ContainsVariable<"username">;
    usernameLabel: string;
    usernamePlaceholder: string;
    usernameSetByInviter: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    cancel: string;
    createAccount: string;
    creating: string;
    loginSuccess: string;
    loginInfo: string;
    createGameServerSuccess: string;
    createGameServerError: string;
  };
  deleteGameServerDialog: {
    title: string;
    explanation: string;
    description: string;
    inputLabel: string;
    cancel: string;
    confirm: string;
  };
  aria: {
    createNewGameServer: string;
    gameServer: ContainsVariable<"serverName">;
  };
  signIn: {
    signIn: string;
    desc: string;
    username: string;
    password: string;
    resetPassword: string;
    question: string;
    continueMeansAccept: string;
    legal: string;
    incorrectCredentials: string;
    loading: string;
    logout: string;
  };
  consequence: ContainsVariable<"counter">; // example
  logDisplay: {
    serverLog: string;
    timestampFormat: string;
  };
  serverPage: {
    notFound: string;
    start: string;
    stop: string;
    pullingImage: string;
    status: string;
    back: string;
    navbar: {
      overview: string;
      console: string;
      metrics: string;
      file_explorer: string;
      settings: string;
    };
  };
  serverStatus: {
    RUNNING: string;
    STARTING: string;
    STOPPED: string;
    FAILED: string;
    PULLING_IMAGE: string;
    AWAITING_UPDATE: string;
    STOPPING: string;
  };
  components: {
    CreateGameServer: {
      backButton: string;
      nextStepButton: string;
      createServerButton: string;
      listInput: {
        addButton: string;
      };
      steps: {
        step1: {
          title: string;
          gameSelection: {
            title: string;
            description: string;
            errorLabel: string;
            placeholder: string;
            noGamesFound: string;
            noResultsLabel: string;
          };
        };
        step2: {
          title: string;
          description: string;
          templateSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          serverNameSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
        };
        step3: {
          title: string;
          description: string;
          dockerImageSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          imageTagSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          portSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          environmentVariablesSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          executionCommandSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          hostPathSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          memoryLimitSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
          cpuLimitSelection: {
            title: string;
            description: string;
            errorLabel: string;
        };
      };
      autoCompleteInputField: {
        loadingLabel: string;
        noResultsLabel: string;
      };
    };
    editGameServer: {
      title: ContainsVariable<"serverName">;
      description: string;

      cancel: string;
      confirm: string;
      missingUuidError: string;

      gameSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      serverNameSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      dockerImageSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      imageTagSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      portSelection: {
        title: string;
        errorLabel: string;
        description: string;
        placeholder: {
          containerPort: string;
          instancePort: string;
          protocol: string;
        };
      };

      environmentVariablesSelection: {
        title: string;
        errorLabel: string;
        description: string;
      };

      executionCommandSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      volumeMountSelection: {
        title: string;
        errorLabel: string;
        description: string;
      };

      memoryLimitSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };

      cpuLimitSelection: {
        title: string;
        description: string;
        errorLabel: string;
      };
    };
  };
  genericModal: {
    cancel: string;
  };
};

type ContainsVariable<T extends string> = `${string}{$T}${string}`;
