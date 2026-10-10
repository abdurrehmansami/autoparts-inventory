import { z } from 'zod'

export const credentialsSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(4).max(200)
})
export type Credentials = z.infer<typeof credentialsSchema>

export const setupSchema = credentialsSchema.extend({
  shopName: z.string().trim().min(1).max(100)
})
export type SetupInput = z.infer<typeof setupSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(4).max(200)
})
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
