import { Suspense } from "react";
import { Metadata } from "next";
import { LecturerScoreEntryView } from "@/components/views/lecturer/LecturerScoreEntryView";

export const metadata: Metadata = {
  title: "Continuous Assessment & Exam Matrix | UEMP",
  description: "Record, draft, and submit course assessment scores.",
};

async function ScoreEntryContent({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  return <LecturerScoreEntryView courseId={resolvedParams.courseId} />;
}

export default function LecturerCourseScoreEntryPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ScoreEntryContent params={params} />
    </Suspense>
  );
}
