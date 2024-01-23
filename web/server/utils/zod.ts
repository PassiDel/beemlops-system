import { z } from 'h3-zod';

export const ufoDate = z
  .string()
  .optional()
  .transform((t) =>
    t && t.charAt(0) === '"' && t.charAt(t.length - 1) === '"'
      ? t.substring(1, t.length - 1)
      : t
  )
  .superRefine((s, ctx) => {
    const parse = z.string().datetime().optional().safeParse(s);
    if (!parse.success) {
      parse.error.errors.forEach((e) => ctx.addIssue(e));
    }
  });

export const slugString = z
  .string()
  .min(7)
  .max(64)
  .regex(/^[a-z0-9-]{7,64}$/);
