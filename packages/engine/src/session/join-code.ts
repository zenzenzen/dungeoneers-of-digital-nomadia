export const SESSION_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const SESSION_CODE_LENGTH = 6;
export const SESSION_CODE_PATTERN = new RegExp(
  `^[${SESSION_CODE_ALPHABET}]{${SESSION_CODE_LENGTH}}$`,
);

export interface JoinCodeGenerationOptions {
  length?: number;
  randomInt?: (maxExclusive: number) => number;
}

export interface JoinCodeReservationOptions extends JoinCodeGenerationOptions {
  maxAttempts?: number;
}

const defaultRandomInt = (maxExclusive: number): number =>
  Math.floor(Math.random() * maxExclusive);

export function normalizeSessionCode(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]+/g, "");
}

export function isValidSessionCode(input: string): boolean {
  return SESSION_CODE_PATTERN.test(normalizeSessionCode(input));
}

export function generateSessionCode(options: JoinCodeGenerationOptions = {}): string {
  const length = options.length ?? SESSION_CODE_LENGTH;
  const randomInt = options.randomInt ?? defaultRandomInt;
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += SESSION_CODE_ALPHABET[randomInt(SESSION_CODE_ALPHABET.length)];
  }

  return code;
}

export async function reserveSessionCode(
  isAvailable: (candidate: string) => Promise<boolean>,
  options: JoinCodeReservationOptions = {},
): Promise<string> {
  const maxAttempts = options.maxAttempts ?? 32;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateSessionCode(options);

    if (await isAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to reserve a unique session code after repeated attempts.");
}
