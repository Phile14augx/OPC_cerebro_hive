import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/discovery/metadata";
import { JsonLd } from "@/components/discovery";
import { CourseSchema } from "@/components/discovery/CourseSchema";
import { courses } from "@/lib/data/academy/courses";
import { buildCollectionPageSchema } from "@/lib/discovery";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Certification Courses for Enterprise Teams | CerebroHive Academy",
  description: "10 specialized AI courses, 4 learning paths, and corporate cohort programs. Earn industry-recognized certifications in LLMs, RAG, AI Agents, Fine-Tuning, and AI Governance. Trusted by 10,000+ learners.",
  path: "/academy",
  keywords: ["AI certification courses", "enterprise AI training", "LLM courses online", "AI agent certification", "RAG pipeline course", "AI governance certification", "corporate AI training", "AI learning platform India"],
  ogImage: "https://cerebropchive.org/opengraph-image/academy",
});

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  const collectionSchema = buildCollectionPageSchema({
    name: "CerebroHive Academy — AI Certification Courses",
    description: "10 specialized AI courses, 4 learning paths, and corporate cohort programs — covering LLMs, RAG, Multi-Agent Systems, Fine-Tuning, and AI Governance.",
    url: "https://cerebropchive.org/academy",
    items: courses.map((c) => ({
      name: c.title,
      url: `https://cerebropchive.org/academy/courses#${c.id}`,
    })),
  });

  return (
    <>
      <JsonLd schema={collectionSchema} />
      {courses.map((course) => (
        <CourseSchema key={course.id} course={course} />
      ))}
      {children}
    </>
  );
}
