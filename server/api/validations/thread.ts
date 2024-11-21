import { z } from "zod";


export const createThreadRequest = z.object({
    name: z.string().min(1),
    systemMessage: z.string().min(5),
    temperature: z.number().min(0).max(1),
    model: z.string(),
    maxTokens: z.number().min(1),
});