/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect, useCallback, useState } from "react";
import { BsArrowLeft, BsThreeDotsVertical } from "react-icons/bs";
import clsx from "clsx";
import { useRouter } from "next/router";
import { API } from "@/api";
import {
  Button,
  ButtonIcon,
  ButtonOrderType,
  Icon,
  IconText,
  Modal,
  Paragraph,
} from "@/components";
import { useAppSelector } from "@/libs/redux";
import { useDevice } from "@/hooks";
import { checkPermission, api } from "@/utils";
import {
  ProblemType,
  ContentViewType,
  UserType,
  ContentAccessType,
} from "@/types";
import { PROBLEM_BLANK } from "@/consts";
import { PageTemplate } from "@/templates";
import { ProblemEditPage } from "../../ProblemCreate";
import {
  ProblemDetailMain,
  ProblemDetailMainSkeleton,
  ProblemDetailTopics,
} from "../components";
import { ButtonList, ButtonListEntry } from "@/components/Button/ButtonList";

interface ProblemData {
  label: string;
  value?: string | number;
}

interface ProblemAction extends ButtonListEntry {
  permission?: ContentAccessType;
}

interface ProblemProps {
  id: string;
  user: UserType;
}

export function ProblemDetailPage({ id, user }: ProblemProps) {
  const stateProblem = useState<ProblemType>(
    PROBLEM_BLANK as unknown as ProblemType
  );
  const [problem, setProblem] = stateProblem;
  const { title, topicId, subTopicId, authorId, solveds } = problem;
  const stateAccept = useState<unknown>({
    content: "",
  });
  const stateLoading = useState(true);
  const [loading, setLoading] = stateLoading;
  const stateMode = useState<ContentViewType>("view");
  const [mode, setMode] = stateMode;
  const stateUserAnswer = useState<any>();
  const setUserAnswer = stateUserAnswer[1];
  const stateUserSolved = useState(false);
  const setUserSolved = stateUserSolved[1];
  const stateSubmitted = useState<number>();
  const setSubmitted = stateSubmitted[1];
  const stateSolvable = useState(false);
  const setSolvable = stateSolvable[1];
  const stateMobileAction = useState(false);
  const setMobileAction = stateMobileAction[1];

  const router = useRouter();
  const allUserSolved = useAppSelector("solveds");
  const { device } = useDevice();

  const solveCache = useMemo(
    () => allUserSolved && allUserSolved[id],
    [allUserSolved, id]
  );

  const permission = useMemo<ContentAccessType>(() => {
    if (user && problem) {
      if (problem.authorId === user.id) {
        return "author";
      }
    }
    return "viewer";
  }, [problem, user]);

  const problemData = useMemo<ProblemData[]>(
    () => [
      {
        label: "Author",
        value: authorId,
      },
      {
        label: "Solved",
        value: (solveds ?? []).length,
      },
    ],
    [authorId, solveds]
  );

  const handleDeleteProblem = useCallback(async () => {
    await api
      .delete("/problem", {
        params: {
          id,
        },
      })
      .then(() => {
        console.log("problem deleted");
        router.push("/");
      })
      .catch((e) => {
        console.log("Result:");
        console.log(e);
        return null;
      });
  }, [id, router]);

  const problemAction = useMemo<ProblemAction[]>(
    () => [
      {
        label: "Edit",
        handler: () => {
          setMode("edit");
        },
        permission: "author",
      },
      {
        label: "Delete",
        handler: handleDeleteProblem,
        permission: "author",
      },
      {
        label: "Bookmark",
        handler: () => 0,
        permission: "viewer",
      },
    ],
    [handleDeleteProblem, setMode]
  );

  const renderQuestion = useMemo(() => {
    if (loading || !problem) return <ProblemDetailMainSkeleton />;

    return (
      <ProblemDetailMain
        stateProblem={stateProblem}
        stateAccept={stateAccept}
        stateMode={stateMode}
        stateSubmited={stateSubmitted}
        stateSolvable={stateSolvable}
        stateUserAnswer={stateUserAnswer}
        stateUserSolved={stateUserSolved}
      />
    );
  }, [
    loading,
    problem,
    stateProblem,
    stateAccept,
    stateMode,
    stateSubmitted,
    stateSolvable,
    stateUserAnswer,
    stateUserSolved,
  ]);

  const handleGoBack = useCallback(() => {
    if (window.history?.length) {
      console.log("YES!!");
      router.back();
    } else {
      console.log("BYE BYE");
      router.replace("/");
    }
  }, [router]);

  const handleGetProblems = useCallback(async () => {
    if (!loading) return;

    setLoading(true);

    const result = await API("get_problem", {
      params: {
        id,
      },
    })
      .then(({ data }) => {
        if (!data) throw Error("");

        const { id } = data;
        setProblem(data);
        setLoading(false);

        return id;
      })
      .catch(() => null);

    if (result && user) {
      let existing: string | null;

      if (!solveCache) {
        const record = await API("get_solved", {
          params: {
            userId: user.id,
            problemId: result,
          },
        });

        existing = record.data ? JSON.parse(record.data.answer) : null;
      } else {
        existing = solveCache;
      }

      if (existing) {
        setUserAnswer(existing);
        setUserSolved(true);
        setSolvable(false);
        setSubmitted(new Date().getTime());
      } else {
        setSolvable(true);
      }
    }
  }, [
    id,
    loading,
    setLoading,
    setProblem,
    setSolvable,
    setSubmitted,
    setUserAnswer,
    setUserSolved,
    solveCache,
    user,
  ]);

  useEffect(() => {
    handleGetProblems();
  }, [handleGetProblems]);

  const renderNavigation = useMemo(
    () => (
      <IconText
        IconComponent={BsArrowLeft}
        text="Back"
        className="mb-4 text-teal-600 cursor-pointer"
        onClick={handleGoBack}
      />
    ),
    [handleGoBack]
  );

  const renderHead = useMemo(
    () => (
      <>
        {renderNavigation}
        <div className="flex  justify-between mb-4">
          <div className="flex-1">
            <h1 className="mt-2 mb-4">{title}</h1>
            <ProblemDetailTopics
              className="mb-8"
              topic={topicId}
              subTopic={subTopicId}
            />
          </div>
          {device === "mobile" && (
            <ButtonIcon
              variant="outline"
              onClick={() => {
                setMobileAction((prev) => !prev);
              }}
              icon={BsThreeDotsVertical}
            />
          )}
        </div>
      </>
    ),
    [device, renderNavigation, setMobileAction, subTopicId, title, topicId]
  );

  const renderProblemData = useMemo(
    () => (
      <ul className="md:w-48">
        {problemData.map(({ label, value }, idx) => (
          <li
            className={clsx("flex justify-between", idx > 0 && "mt-1")}
            key={label}
          >
            <Paragraph color="secondary-5">{label}</Paragraph>
            <Paragraph>{value}</Paragraph>
          </li>
        ))}
      </ul>
    ),
    [problemData]
  );

  const renderProblemAction = useMemo(() => {
    const actions = problemAction.filter(({ permission: perm }) =>
      checkPermission(permission, perm)
    );
    return <ButtonList list={actions} className="w-48" />;
  }, [permission, problemAction]);

  const renderMobileAction = useMemo(
    () => <Modal stateVisible={stateMobileAction}>{renderProblemAction}</Modal>,
    [renderProblemAction, stateMobileAction]
  );

  const renderSide = useMemo(
    () => (
      <div className="flex flex-col gap-8">
        {renderProblemData}
        {device === "mobile" ? renderMobileAction : renderProblemAction}
      </div>
    ),
    [device, renderMobileAction, renderProblemAction, renderProblemData]
  );

  const renderViewProblem = useMemo(
    () => (
      <PageTemplate
        className="w-full"
        head={!loading && renderHead}
        side={!loading && renderSide}
      >
        {renderQuestion}
      </PageTemplate>
    ),
    [loading, renderHead, renderQuestion, renderSide]
  );

  const renderEditProblem = useMemo(
    () => (
      <ProblemEditPage
        stateProblem={stateProblem}
        onEdit={() => {
          setMode("view");
        }}
        onLeaveEditor={() => {
          setMode("view");
        }}
      />
    ),
    [setMode, stateProblem]
  );

  return mode === "edit" ? renderEditProblem : renderViewProblem;
}
