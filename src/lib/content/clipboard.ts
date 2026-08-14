export async function copy_text(value: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error(
      'The Clipboard API is unavailable in this browser context.',
    )
  }

  await navigator.clipboard.writeText(value)
}
