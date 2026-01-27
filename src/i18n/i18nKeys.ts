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
    TemplateVariableForm: {
      title: string;
      noTemplateSelected: string;
      noVariables: string;
      selectPlaceholder: string;
      example: string;
      pattern: string;
      validationError: string;
      validationErrorRequired: string;
      validationErrorNumber: string;
      validationErrorBoolean: string;
      validationErrorSelect: string;
      validationErrorPattern: string;
      booleanTrue: string;
      booleanFalse: string;
    };
    CreateGameServer: {
      backButton: string;
      nextStepButton: string;
      useTemplate: string;
      useNoTemplate: string;
      createServerButton: string;
      reapplyDialog: {
        title: string;
        description: string;
        cancel: string;
        confirm: string;
      };
      listInput: {
        addButton: string;
      };
      steps: {
        step1: {
          title: string;
          serverNameSelection: {
            title: string;
            description: string;
            errorLabel: string;
          };
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
            noResultsLabel: string;
            placeholder: string;
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
    };
    userManagement: {
      backButton: string;
      userDetailButton: {
        viewUsers: string;
      };
      userRow: {
        roles: {
          owner: string;
          admin: string;
          quota_user: string;
        };
        resources: {
          cpus: string;
          memory: string;
          storage: string;
          unlimited: string;
        };
        moreOptions: string;
      };
      userTable: {
        search: string;
        filter: string;
        sort: string;
        resetFilter: string;
        clearSort: string;
        sortBy: {
          username: string;
          role: string;
          max_cpu: string;
          max_memory: string;
        };
        noUsersFound: string;
        pendingInvites: string;
      };
    };
    fileBrowser: {
      filePreview: {
        previewFailure: string;
        loadingPreview: string;
        selectPreview: string;
        noPreviewAvailable: ContainsVariable<"textError">;
      };
      fileBrowserList: {
        failedToCreateFolder: string;
        failedToRename: string;
        failedToDelete: string;
        newFolderAction: string;
        refreshAction: string;
        noFiles: string;
        directoryType: string;
        fileType: string;
        renameAction: string;
        deleteAction: string;
        downloadAction: string;
        downloadFile: ContainsVariable<"fileName">;
        createFolderAction: string;
        createFolderDescription: ContainsVariable<"dirName">;
        folderName: string;
        creatingInProgress: string;
        createAction: string;
        renameDescription: ContainsVariable<"fileName"> & ContainsVariable<"currentPath">;
        newName: string;
        renameInProgress: string;
        deleteDescription: ContainsVariable<"fileName">;
        deleteDialogFolder: string;
        deleteDialogFile: string;
        cancel: string;
        deleteInProgress: string;
      };
      fileBrowserDialog: {
        uploadFailure: string;
        downloadZipFailure: string;
        preparing: string;
        downloadingFile: ContainsVariable<"done"> & ContainsVariable<"total">;
        downloadAllAction: string;
        uploadFile: string;
        renamePlaceholder: string;
      };
    };
  };
  genericModal: {
    cancel: string;
  };
  metrics: {
    metricTitle: string;
    metricDescription: string;
    configure: string;
    types: {
      CPU_PERCENT: string;
      MEMORY_PERCENT: string;
      MEMORY_USAGE: string;
      MEMORY_LIMIT: string;
      NETWORK_INPUT: string;
      NETWORK_OUTPUT: string;
      BLOCK_READ: string;
      BLOCK_WRITE: string;
    };
  };
  timerange: {
    localTime: string;
    custom: string;
    button: string;
    min: string;
    hour: string;
    day: string;
    apply: string;
    cancel: string;
  };
  datepicker: {
    title: string;
    des: string;
  };
};

type ContainsVariable<T extends string> = `${string}{{${T}}}${string}`;
