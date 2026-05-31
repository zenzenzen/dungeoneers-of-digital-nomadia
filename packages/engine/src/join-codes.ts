const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateJoinCode(random = Math.random): string {
  let code = "";

  for (let index = 0; index < 6; index += 1) {
    const position = Math.floor(random() * CODE_ALPHABET.length);
    code += CODE_ALPHABET[position];
  }

  return code;
}

export function normalizeJoinCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z2-9]/g, "");
}
