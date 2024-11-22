import { z } from "zod";

export const signInRequest = z.object({
  email: z.string().email(),
  password: z
    .string({
      errorMap: () => ({
        message: "Password must be at least 6 characters long",
      }),
    })
    .min(6),
});

export const signUpRequest = z.object({
  email: z.string().email(),
  password: z
    .string({
      errorMap: () => ({
        message: "Password must be at least 6 characters long",
      }),
    })
    .min(6),
});
