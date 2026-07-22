import { AcademyCourse } from "@/lib/data/academy/courses";
import { buildCourseSchema, buildCredentialSchema } from "@/lib/discovery";
import { JsonLd } from "./JsonLd";

interface CourseSchemaProps {
  course: AcademyCourse;
}

export function CourseSchema({ course }: CourseSchemaProps) {
  const courseSchema = buildCourseSchema({
    name: course.title,
    description: course.desc,
    courseCode: course.code,
    educationalLevel: course.level,
    duration: course.duration,
    skills: course.topics,
  });

  const credentialSchema = buildCredentialSchema({
    name: course.cert,
    courseCode: course.code,
    description: `${course.cert} — awarded upon successful completion of ${course.title} by CerebroHive Academy.`,
  });

  return (
    <>
      <JsonLd schema={courseSchema} />
      <JsonLd schema={credentialSchema} />
    </>
  );
}
