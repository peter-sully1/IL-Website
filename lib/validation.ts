import { z } from "zod";

export const articleInputSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(1, "Add a title.").max(200, "Keep the title under 200 characters."),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.")
    .optional()
    .or(z.literal("")),
  excerpt: z.string().trim().max(400, "Keep the summary under 400 characters.").optional(),
  contentJson: z.string().min(2).max(2_000_000),
  contentHtml: z.string().max(2_000_000),
  coverImagePath: z.string().max(300).optional().or(z.literal("")),
  intent: z.enum(["draft", "publish", "unpublish"]),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
