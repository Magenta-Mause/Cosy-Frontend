import type { i18nLanguage } from "@/i18n/i18nKeys";

const translation: i18nLanguage = {
  overviewPage: {
    createNewServer: "Neuer Game Server",
  },
  rightClickMenu: {
    edit: "Bearbeiten",
    delete: "Löschen",
    startServer: "Starten",
    stopServer: "Stoppen",
    refresh: "Aktualisieren",
    createNewGameserver: "Neuen Gameserver erstellen",
    viewLogs: "Logs anzeigen",
    loading: "Lädt...",
    failed: "Starten fehlgeschlagen",
  },
  toasts: {
    notImplemented: "Noch nicht implementiert!",
    deleteGameServerSuccess: "Gameserver-Konfiguration erfolgreich gelöscht!",
    deleteGameServerError: "Fehler beim Löschen der Gameserver-Konfiguration!",
    refreshGameServersSuccess: "Gameserver-Konfigurationen erfolgreich aktualisiert!",
    refreshGameServersError: "Fehler beim Aktualisieren der Gameserver-Konfigurationen!",
    inviteCreatedSuccess: "Einladung erfolgreich erstellt",
    inviteCreateError: 'Fehler beim Erstellen der Einladung. "{{error}}"',
    inviteRevokedSuccess: "Einladung widerrufen",
    inviteRevokeError: "Fehler beim Widerrufen der Einladung",
    copyClipboardSuccess: "Link in die Zwischenablage kopiert",
    passwordsDoNotMatch: "Passwörter stimmen nicht überein",
    usernameRequired: "Benutzername ist erforderlich",
    accountCreatedSuccess:
      "Konto erfolgreich erstellt! Melde dich jetzt an, um dein Profil zu erstellen.",
    accountCreateError: 'Fehler beim Erstellen des Kontos. "{{error}}"',
    createGameServerSuccess: "Gameserver erfolgreich erstellt!",
    serverStartError: 'Fehler beim Starten des Servers. "{{error}}"',
    serverStartSuccess: "Server erfolgreich gestartet.",
    serverStopError: 'Fehler beim Stoppen des Servers. "{{error}}"',
    serverStopSuccess: "Server erfolgreich gestoppt.",
    updateGameServerSuccess: "Game-Server erfolgreich aktualisiert!",
    updateGameServerError: "Fehler beim Aktualisieren des Game-Servers",
    missingUuid: "Die Server UUID fehlt",
  },
  userModal: {
    title: "Benutzer",
    inviteUserTitle: "Benutzer einladen",
    inviteCreatedTitle: "Einladung erstellt",
    inviteBtn: "Einladen",
    usernameLabel: "Benutzername (Optional)",
    usernamePlaceholder: "Benutzername eingeben...",
    usernameDescription: "Leer lassen, damit der Benutzer seinen eigenen Namen wählen kann.",
    cancel: "Abbrechen",
    generateInvite: "Einladung erstellen",
    creating: "Erstelle...",
    shareInstructions:
      "Teilen Sie diesen Link mit der Person, die Sie einladen möchten. Sie kann ihn nutzen, um ihr Konto zu erstellen.",
    copyLink: "Einladungslink kopieren",
    backToUsers: "Zurück zu Benutzern",
    pendingInvites: "Ausstehende Einladungen",
    unclaimedInvite: "Nicht beanspruchte Einladung",
    created: "Erstellt: {{date}}",
    revokeTooltip: "Einladung widerrufen",
    copyTooltip: "Klicken zum Kopieren",
    roleLabel: "Benutzerrolle",
    editTooltip: "Klicken zum Bearbeiten der Benutzereinstellungen",
    memoryLimit: "RAM limit (Optional)",
    memoryDescription: "Leer lassen, damit der Benutzer unbegrenzt RAM zur Verfügung hat.",
    cpuLimit: "CPU limit (Optional)",
    cpuDescription: "Leer lassen, damit der Benutzer unbegrenzte CPU Kerne zur Verfügung hat.",
    placeholder: "Unbegrenzt",
  },
  userRoles: {
    QUOTA_USER: "Nutzer",
    ADMIN: "Admin",
    OWNER: "Besitzer",
  },
  inviteRedemption: {
    title: "Einladung annehmen",
    description: "Erstellen Sie Ihr Konto, um dem Server Yard beizutreten.",
    invalidLink: "Ungültiger oder abgelaufener Einladungslink.",
    close: "Schließen",
    invitedBy: "Eingeladen von {{username}}",
    usernameLabel: "Benutzername",
    usernamePlaceholder: "Benutzername wählen",
    usernameSetByInviter: "* Benutzername vom Einladenden festgelegt",
    passwordLabel: "Passwort",
    passwordPlaceholder: "Passwort",
    confirmPasswordLabel: "Passwort bestätigen",
    confirmPasswordPlaceholder: "Passwort",
    cancel: "Abbrechen",
    createAccount: "Konto erstellen",
    creating: "Erstelle...",
    loginSuccess: "Erfolgreich eingeloggt",
    loginInfo: "Bitte loggen Sie sich mit Ihrem neuen Konto ein.",
    createGameServerSuccess: "Gameserver erfolgreich erstellt!",
    createGameServerError: "Fehler beim Erstellen des Gameservers!",
  },
  deleteGameServerDialog: {
    title: "Sind Sie sicher?",
    description: "Diese Aktion kann nicht rückgängig gemacht werden!",
    explanation:
      "Dadurch wird Ihre Gameserver-Konfiguration dauerhaft gelöscht und die zugehörigen Daten von dem Server entfernt.",
    inputLabel: "Geben Sie den Namen des Gameservers ein, um sicherzugehen:",
    cancel: "Abbrechen",
    confirm: "Löschen",
  },
  aria: {
    createNewGameServer: "Erstelle eine neue Gameserver-Konfiguration",
    gameServer: "Gameserver-Konfiguration: {{serverName}}",
  },
  signIn: {
    signIn: "Anmelden",
    desc: "C.O.S.Y. - Cost Optimized Server Yard",
    username: "Benutzername",
    password: "Passwort",
    resetPassword: "Passwort vergessen?",
    question: "Du bist nicht angemeldet",
    continueMeansAccept: "Durch die Anmeldung akzeptieren Sie unsere",
    legal: "Datenschutzerklärung",
    incorrectCredentials: "Falscher Benutzername oder Passwort.",
    loading: "Lädt...",
    logout: "Abmelden",
  },
  consequence: "asd{{counter}}ajskod",
  components: {
    CreateGameServer: {
      backButton: "Zurück",
      nextStepButton: "Weiter",
      createServerButton: "Server erstellen",
      reapplyDialog: {
        title: "Template erneut anwenden?",
        description:
          "Sie haben die Template-Variablen geändert. Möchten Sie das Template mit den neuen Werten erneut anwenden? Dies überschreibt alle manuellen Änderungen, die Sie in Schritt 3 vorgenommen haben.",
        cancel: "Aktuelle Werte behalten",
        confirm: "Template erneut anwenden",
      },
      listInput: {
        addButton: "Hinzufügen",
      },
      steps: {
        step1: {
          title: "Schritt 1: Spiel auswählen",
          serverNameSelection: {
            title: "Servername",
            description: "Benennen Sie Ihren Server",
            errorLabel: "Bitte geben Sie einen gültigen Servernamen ein.",
          },
          gameSelection: {
            title: "Spiel auswählen",
            description: "Wählen Sie ein Spiel für Ihren Server aus.",
            errorLabel: "Bitte wählen Sie ein gültiges Spiel aus.",
            placeholder: "Spiel suchen...",
            noGamesFound:
              "Fehler beim Abrufen der Spiele. Wählen Sie dies für das Standardspiel. (kein spezifisches Spiel)",
            noResultsLabel: "Kein Spiel gefunden.",
          },
        },
        step2: {
          title: "Schritt 2: Vorlage und Name auswählen",
          description: "Wählen Sie eine Vorlage und einen Namen für Ihren Server aus.",
          templateSelection: {
            title: "Vorlage",
            description: "Wählen Sie eine Vorlage für Ihren Server aus",
            errorLabel: "Bitte wählen Sie eine gültige Vorlage aus.",
            noResultsLabel: "Keine Vorlagen gefunden.",
          },
        },
        step3: {
          title: "Schritt 3: Konfigurieren Sie Ihren Server",
          description: "Hier können Sie Ihren Server konfigurieren.",
          dockerImageSelection: {
            title: "Docker-Image",
            description: "Docker-Image für Ihren Server",
            errorLabel: "Bitte geben Sie ein gültiges Docker-Image ein.",
          },
          imageTagSelection: {
            title: "Image-Tag",
            description: "Tag für das Docker-Image",
            errorLabel: "Bitte geben Sie ein gültiges Image-Tag ein.",
          },
          portSelection: {
            title: "Port",
            description: "Port, der zu Ihrem Server weitergeleitet wird.",
            errorLabel: "Bitte geben Sie einen gültigen Port ein.",
          },
          environmentVariablesSelection: {
            title: "Umgebungsvariable",
            description: "Umgebungsvariablen für Ihren Server",
            errorLabel:
              "Entweder müssen sowohl Schlüssel als auch Wert angegeben werden oder keiner von beiden.",
          },
          executionCommandSelection: {
            title: "Ausführungsbefehl",
            description: "Befehl zum Starten Ihres Servers",
            errorLabel: "Bitte geben Sie ein gültiges Ausführungsbefehl ein.",
          },
          hostPathSelection: {
            title: "Volume-Mount",
            description: "Volume-Mounts für Ihren Server",
            errorLabel:
              "Entweder müssen sowohl Host-Pfad als auch Container-Pfad angegeben werden oder keiner von beiden.",
          },
        },
      },
      autoCompleteInputField: {
        loadingLabel: "Lädt...",
        noResultsLabel: "Kein Ergebnis gefunden.",
      },
    },
    TemplateVariableForm: {
      title: "Template-Variablen",
      noTemplateSelected: "Kein Template ausgewählt",
      noVariables: "Dieses Template hat keine anpassbaren Variablen",
      selectPlaceholder: "Wähle eine Option",
      example: "Beispiel",
      pattern: "Muster",
      validationError: "Bitte geben Sie einen gültigen Wert ein",
      validationErrorRequired: "Dieses Feld ist erforderlich",
      validationErrorNumber: "Bitte geben Sie eine gültige Zahl ein",
      validationErrorBoolean: "Bitte wählen Sie eine gültige Option",
      validationErrorSelect: "Bitte wählen Sie eine gültige Option",
      validationErrorPattern: "Der Wert entspricht nicht dem erforderlichen Muster",
      booleanTrue: "Ja",
      booleanFalse: "Nein",
    },
    editGameServer: {
      title: "{{serverName}}",
      description: "Aktualisiere die Konfiguration deines Game-Servers",

      cancel: "Abbrechen",
      confirm: "Änderungen speichern",
      missingUuidError: "Die Server UUID fehlt",

      gameSelection: {
        title: "Spiel ID",
        description: "Das Spiel, zu dem dieser Server gehört",
        errorLabel: "Spiel ID ist erforderlich",
      },

      serverNameSelection: {
        title: "Servername",
        description: "Der Name deines Servers",
        errorLabel: "Servername ist erforderlich",
      },

      dockerImageSelection: {
        title: "Docker-Image",
        description: "Das Docker-Image, das zum Ausführen des Servers verwendet wird",
        errorLabel: "Docker-Image-Name ist erforderlich",
      },

      imageTagSelection: {
        title: "Image-Tag",
        description: "Der Docker-Image-Tag",
        errorLabel: "Docker-Image-Tag ist erforderlich",
      },

      portSelection: {
        title: "Port-Zuordnungen",
        errorLabel: "Port muss eine Zahl zwischen 1 und 65535 sein",
        description: "Port, auf dem dein Server läuft",
        placeholder: {
          instancePort: "Instanz Port",
          containerPort: "Container Port",
          protocol: "Protokoll",
        },
      },

      environmentVariablesSelection: {
        title: "Umgebungsvariablen",
        errorLabel: "Sowohl Schlüssel als auch Wert sind erforderlich",
        description: "Umgebungsvariablen für deinen Server",
      },

      executionCommandSelection: {
        title: "Ausführungsbefehl",
        description: "Befehl zum Starten des Servers",
        errorLabel: "Ausführungsbefehl darf nicht leer sein",
      },

      volumeMountSelection: {
        title: "Volume-Mounts",
        errorLabel: "Pfad darf nicht leer sein",
        description: "Volume-Mounts für deinen Server",
      },
    },
  },
  genericModal: {
    cancel: "Abbrechen",
  },
  logDisplay: {
    serverLog: "Server-Protokoll",
    timestampFormat: "HH:mm:ss.SSS",
  },
  serverPage: {
    notFound: "Nicht gefunden",
    start: "Starten",
    stop: "Herunterfahren",
    back: "Zurück",
    pullingImage: "Image wird geladen...",
    status: "Status",
    navbar: {
      overview: "Dashboard",
      console: "Console",
      metrics: "Metriken",
      file_explorer: "Dateien",
      settings: "Einstellungen",
    },
  },
  serverStatus: {
    RUNNING: "Läuft",
    STARTING: "Startet",
    STOPPED: "Gestoppt",
    FAILED: "Fehlgeschlagen",
    PULLING_IMAGE: "Image wird geladen",
    AWAITING_UPDATE: "Lädt...",
    STOPPING: "Stoppt...",
  },
};

export default translation;
