import { z } from "zod";


export const createThreadRequest = z.object({
    name: z.string(),
    systemMessage: z.string(),
    temperature: z.number(),
    model: z.string(),
    maxTokens: z.number(),
});