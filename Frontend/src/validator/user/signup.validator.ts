import z from "zod";


export const signupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(7, "Phone number must be at least 7 digits").max(15, "Phone number is too long").regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be under 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;