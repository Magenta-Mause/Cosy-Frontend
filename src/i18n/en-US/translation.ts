import type { i18nLanguage } from "@/i18n/i18nKeys";

const translation: i18nLanguage = {
  index: {
    clickCounter: "Clicks",
    clickBtn: "Click me!",
    dontClickBtn: "Don't click me!",
  },
  redirected: {
    warning: "I told you not to click!",
    consequence: "That cost you all your {{counter}} clicks!",
    noConsequence: "You didn't even have any clicks to repay your wrongdoings!",
    earnMoreClicks: "Earn some more clicks",
  },
};

export default translation;
