/** `https://www.youtube.com/watch?v=1` → `youtube.com` (để ghi nguồn cạnh link video). Link hỏng trả `''`. */
export function videoHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
