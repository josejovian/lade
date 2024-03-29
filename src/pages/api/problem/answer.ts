// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/libs/prisma";
import {
  PROBLEM_SAMPLE_1,
  PROBLEM_SAMPLE_2,
  PROBLEM_SAMPLE_3,
} from "@/libs/firebase/placeholders";
import { parseAnswer, validateAnswer } from "@/utils";
import { ProblemAnswerType, ProblemType } from "@/types";
import { getAuthUser } from "@/libs/next-auth/helper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { method } = req;

  if (method !== "POST") {
    res.status(405).json({ message: "fail" });
    return;
  }

  const { body } = req;

  const { answer, id } = body as unknown as ProblemType;

  try {
    const user = await getAuthUser(req, res);

    if (!user) {
      throw Error("unauthorized");
    }

    const result = await prisma.problem.findUnique({
      where: {
        id: id as unknown as string,
      },
      include: {
        solveds: true,
        topic: true,
        subTopic: true,
      },
    });

    if (!result) {
      throw Error("fail");
    }

    const { answer: accept } = result;

    const type = result.type as unknown as ProblemAnswerType;

    const verdict = validateAnswer(type as any, JSON.parse(accept), answer);

    if (verdict) {
      await prisma.solved.create({
        data: {
          problemId: id as unknown as string,
          userId: user.id,
          answer: JSON.stringify(answer),
        },
      });
    }

    res.status(200).json({
      message: verdict ? "correct" : "wrong",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "internal server error",
    });
  }

  await prisma.$disconnect();
}
