import * as v from 'valibot'

export default v.strictObject({
  entries: v.pipe(
    v.array(
      v.strictObject({
        detail: v.string(),
        title: v.string(),
      }),
    ),
    v.minLength(1),
  ),
})
