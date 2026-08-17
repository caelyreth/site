export async function copy_text(value: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('当前浏览器环境无法使用剪贴板。')
  }

  await navigator.clipboard.writeText(value)
}
