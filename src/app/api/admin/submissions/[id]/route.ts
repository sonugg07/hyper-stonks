import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { status, rejectionReason, points } = body;

    const submission = await prisma.questSubmission.findUnique({
      where: { id },
      include: { quest: true, user: true },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    const previousStatus = submission.status;
    const pointsToAward = points !== undefined ? Number(points) : submission.quest.points;

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
          type: "WAITLIST_REWARD",
          description: `Admin approved submission for "${submission.quest.title}"`,
          referenceId: submission.id,
        },
      });

      await prisma.activityLog.create({
        data: {
          actor: "Admin",
          action: "SUBMISSION_APPROVED",
          details: `Approved submission ${submission.id} (+${pointsToAward} PTS) for ${submission.walletAddress.slice(0, 6)}...`,
        },
      });
    }

    // If transitioned from APPROVED to REJECTED, deduct points
    if (status === "REJECTED" && previousStatus === "APPROVED" && submission.userId) {
      const deduction = submission.pointsAwarded || pointsToAward;
      await prisma.user.update({
        where: { id: submission.userId },
        data: { totalPoints: { decrement: deduction } },
      });

      await prisma.pointsTransaction.create({
        data: {
          userId: submission.userId,
          amount: -deduction,
          type: "ADMIN_ADJUSTMENT",
          description: `Admin rejected/revoked submission for "${submission.quest.title}"`,
          referenceId: submission.id,
        },
      });

      await prisma.activityLog.create({
        data: {
          actor: "Admin",
          action: "SUBMISSION_REJECTED",
          details: `Rejected submission ${submission.id} (-${deduction} PTS) for ${submission.walletAddress.slice(0, 6)}...`,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[Admin Update Submission Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to update submission" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const submission = await prisma.questSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    await prisma.questSubmission.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        actor: "Admin",
        action: "SUBMISSION_DELETED",
        details: `Deleted submission record ${id}`,
      },
    });

    return NextResponse.json({ success: true, message: "Submission deleted successfully." });
  } catch (error) {
    console.error("[Admin Delete Submission Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to delete submission" }, { status: 500 });
  }
}
