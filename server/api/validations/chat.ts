import { z } from "zod";

export const messageRequest = z.object({
  threadId: z.string(),
  prompt: z.string(),
  selectedFiles: z.array(z.number()).optional(),
});
