import { CpuLimitInput } from "@components/display/CpuLimit/CpuLimitInput";
import { MemoryLimitInput } from "@components/display/MemoryLimit/MemoryLimitInput";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useUpdateDockerLimits } from "@/api/generated/backend-api";
import type { UserEntityDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { userSliceActions } from "@/stores/slices/userSlice";

const UpdateDockerLimitsModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.updateDockerLimitsDialog");
  const dispatch = useDispatch();

  const [cpu, setCpu] = useState<string>(
    props.user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "",
  );
  const [memory, setMemory] = useState<string>(
    props.user.docker_hardware_limits?.docker_memory_limit ?? "",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleClose = () => {
    setCpu(props.user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "");
    setMemory(props.user.docker_hardware_limits?.docker_memory_limit ?? "");
    setSubmitError(null);
    props.onClose();
  };

  const { mutate: updateDockerLimits, isPending } = useUpdateDockerLimits({
    mutation: {
      onSuccess: (updatedUser) => {
        dispatch(userSliceActions.updateUser(updatedUser));
        handleClose();
      },
      onError: () => {
        setSubmitError(t("submitError"));
      },
    },
  });

  const handleSubmit = () => {
    if (!props.user.uuid) return;
    setSubmitError(null);
    updateDockerLimits({
      uuid: props.user.uuid,
      data: {
        docker_hardware_limits: {
          docker_max_cpu_cores: cpu !== "" ? parseFloat(cpu) : undefined,
          docker_memory_limit: memory !== "" ? memory : undefined,
        },
      },
    });
  };

  return (
    <Dialog open={props.open} onOpenChange={handleClose}>
      <DialogContent className="min-w-172">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <div className="flex justify-between gap-5">
            <div className="w-[45%]">
              <CpuLimitInput
                header={t("cpuLabel")}
                description={t("cpuDescription")}
                id="docker-cpu-limit"
                placeholder={t("placeholder")}
                value={cpu}
                onChange={(val) => setCpu(val)}
                className="no-spinner"
              />
            </div>
            <div className="w-[50%]">
              <MemoryLimitInput
                id="docker-memory-limit"
                header={t("memoryLabel")}
                description={t("memoryDescription")}
                placeholder={t("placeholder")}
                value={memory}
                onChange={(val) => setMemory(val)}
                className="no-spinner"
              />
            </div>
          </div>
        </DialogMain>
        <DialogFooter>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button variant="secondary" onClick={handleClose}>
            {t("cancelButton")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDockerLimitsModal;
