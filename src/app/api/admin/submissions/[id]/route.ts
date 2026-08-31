import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { status, rejectionReason } = body; // status: "APPROVED" | "REJECTED"

    const submission = await prisma.questSubmission.findUnique({
      where: { id },
      include: { quest: true, user: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const previousStatus = submission.status;
    const pointsToAward = submission.quest.points;

    // Update submission status
    const updated = await prisma.questSubmission.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason || "Rejected by admin" : null,
        pointsAwarded: status === "APPROVED" ? pointsToAward : 0,
        verifiedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    // If transitioned from non-APPROVED to APPROVED, award points to user
    if (status === "APPROVED" && previousStatus !== "APPROVED" && submission.userId) {
      await prisma.user.update({
        where: { id: submission.userId },
        data: { totalPoints: { increment: pointsToAward } },
      });

      await prisma.pointsTransaction.create({
        data: {
          userId: submission.userId,
          amount: pointsToAward,
          type: "QUEST_REWARD",
          description: `Admin approved submission for "${submission.quest.title}"`,
          referenceId: submission.id,
        },
      });
    }

    // If transitioned from APPROVED to REJECTED, deduct points
    if (status === "REJECTED" && previousStatus === "APPROVED" && submission.userId) {
      await prisma.user.update({
        where: { id: submission.userId },
        data: { totalPoints: { decrement: pointsToAward } },
      });

      await prisma.pointsTransaction.create({
        data: {
          userId: submission.userId,
          amount: -pointsToAward,
          type: "ADMIN_ADJUSTMENT",
          description: `Admin revoked approval for "${submission.quest.title}"`,
          referenceId: submission.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ success: false, error: "Failed to update submission" }, { status: 500 });
  }
}
