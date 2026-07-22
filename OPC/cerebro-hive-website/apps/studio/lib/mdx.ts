import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const CONTENT_PATH = path.join(process.cwd(), "content");

export type MDXMetadata = {
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  tags?: string[];
  slug: string;
};

export async function getFiles(dir: string): Promise<string[]> {
  const directory = path.join(CONTENT_PATH, dir);
  if (!fs.existsSync(directory)) {
    return [];
  }
  
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(directory, entry.name);
      return entry.isDirectory() ? getFiles(path.join(dir, entry.name)) : res;
    })
  );
  return Array.prototype.concat(...files).filter((file: string) => file.endsWith(".mdx") || file.endsWith(".md"));
}

export async function getPostBySlug(dir: string, slug: string) {
  const files = await getFiles(dir);
  const file = files.find((f) => f.includes(`${slug}.mdx`) || f.includes(`${slug}.md`));
  
  if (!file) {
    throw new Error(`File not found for slug: ${slug}`);
  }

  const source = await fs.promises.readFile(file, "utf8");
  const { data, content } = matter(source);

  return {
    metadata: {
      ...data,
      slug,
    } as MDXMetadata,
    content,
  };
}

export async function getAllPosts(dir: string): Promise<MDXMetadata[]> {
  const files = await getFiles(dir);
  
  const posts = await Promise.all(
    files.map(async (file) => {
      const source = await fs.promises.readFile(file, "utf8");
      const { data } = matter(source);
      
      const relativePath = path.relative(path.join(CONTENT_PATH, dir), file);
      const slug = relativePath.replace(/\.mdx?$/, "").replace(/\\/g, "/");

      return {
        ...data,
        slug,
      } as MDXMetadata;
    })
  );

  return posts.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}
