import { Card } from "@components/ui/card.tsx";
import Icon from "@components/ui/Icon.tsx";
import type { TemplateEntity } from "@/api/generated/model";
import checkmarkIcon from "@/assets/icons/checkmark.svg?raw";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const TemplateList = ({
  templates,
  selectedTemplate,
  handleCardClick,
}: {
  templates: TemplateEntity[];
  selectedTemplate: TemplateEntity | null;
  handleCardClick: (template: TemplateEntity) => void;
}) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");

  return (
    <div className="flex flex-row gap-2 overflow-x-auto pb-1">
      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("templateSelection.noResultsLabel")}</p>
      ) : (
        templates.map((template) => {
          const isSelected = template.uuid === selectedTemplate?.uuid;
          return (
            <Card
              key={template.uuid}
              className={`relative shrink-0 cursor-pointer transition-colors select-none px-3 py-2 gap-0.5 max-w-[200px] ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleCardClick(template)}
            >
              <div className="flex items-center gap-2 pr-5">
                <span className="text-sm font-semibold leading-none">{template.name}</span>
                {isSelected && (
                  <Icon
                    src={checkmarkIcon}
                    className="absolute top-2 right-2 size-4 text-primary"
                  />
                )}
              </div>
              {template.description && (
                <p className="text-xs text-muted-foreground wrap-anywhere">
                  {template.description}
                </p>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

export default TemplateList;
