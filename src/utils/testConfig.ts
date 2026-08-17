/**
 * Configuration for test mode users who can complete purchases / payments
 * without paying real money (for testing receipt printing, downloads, and workflows).
 */
export const TEST_BYPASS_EMAILS = [
  'hellopatel555@gmail.com',
];

export function isTestUser(email?: string | null): boolean {
  if (!email) return false;
  return TEST_BYPASS_EMAILS.some(
    testEmail => testEmail.toLowerCase() === email.trim().toLowerCase()
  );
}

export function generateTestPaymentId(): string {
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `pay_test_${randomStr}`;
}
