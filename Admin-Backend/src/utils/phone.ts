/** Normalize Ethiopian mobile numbers to +251XXXXXXXXX */
export function normalizeEthiopiaPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("251")) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.length === 9 && digits.startsWith("9")) {
    return `+251${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("09")) {
    return `+251${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("2519")) {
    return `+${digits}`;
  }
  return input.trim();
}

/** Digits only for synthetic driver email local-part */
export function phoneDigitsForSyntheticEmail(normalizedPhone: string): string {
  return normalizedPhone.replace(/\D/g, "").replace(/^251/, "");
}
