import { useCallback, useMemo, useState } from "react";
import { API } from "@/api";
import { PageTemplate } from "@/templates";
import { ProblemType, StateType } from "@/types";
import { ProblemCreateEditor } from "../components";

export function ProblemEditPage({
  stateProblem,
  onEdit,
  onLeaveEditor,
}: {
  stateProblem: StateType<ProblemType>;
  onEdit?: () => void;
  onLeaveEditor?: () => void;
}) {
  const setProblem = stateProblem[1];

  const stateLoading = useState(false);
  const [, setLoading] = stateLoading;

  const renderHead = useMemo(() => {
    return <h1 className="mb-8">Edit Problem</h1>;
  }, []);

  const handleSubmit = useCallback(
    async (values: ProblemType) => {
      await API("patch_problem", {
        body: values,
      })
        .then(() => {
          setLoading(false);
          setProblem(values);
          onEdit && onEdit();
        })
        .catch((e) => {
          console.log(e);
          setLoading(false);
        });
    },
    [onEdit, setLoading, setProblem]
  );

  return (
    <PageTemplate>
      <ProblemCreateEditor
        headElement={renderHead}
        stateProblem={stateProblem}
        stateLoading={stateLoading}
        onSubmit={handleSubmit}
        onLeaveEditor={onLeaveEditor}
        disableEditId
      />
    </PageTemplate>
  );
}
