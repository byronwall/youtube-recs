export function truncate(inputStr: string, length: number) {
  return inputStr.length > length
    ? inputStr.substring(0, length) + "..."
    : inputStr;
}
