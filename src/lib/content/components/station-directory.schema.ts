import { z } from 'zod'

export default z
  .object({
    entries: z
      .array(
        z
          .object({
            detail: z.string(),
            title: z.string(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
