/**
 * Pre-define globals that expo/src/winter/runtime.native.ts would otherwise
 * install via lazy getters. By defining them as NON-configurable before the
 * expo setup runs, installGlobal() sees them and skips, which avoids the
 * "import a file outside of the scope of the test code" error.
 */

const globals: Record<string, unknown> = {
  TextDecoderStream: class TextDecoderStream {},
  TextEncoderStream: class TextEncoderStream {},
  TextDecoder:
    typeof globalThis.TextDecoder !== "undefined"
      ? globalThis.TextDecoder
      : class TextDecoder {
          encoding = "utf-8";
          fatal = false;
          ignoreBOM = false;
          constructor(_label?: string, _options?: any) {}
          decode(_input?: BufferSource): string {
            return "";
          }
        },
  structuredClone:
    typeof globalThis.structuredClone !== "undefined"
      ? globalThis.structuredClone
      : <T>(value: T): T => JSON.parse(JSON.stringify(value)),
};

for (const [name, value] of Object.entries(globals)) {
  const existing = Object.getOwnPropertyDescriptor(globalThis, name);
  if (!existing || existing.configurable) {
    Object.defineProperty(globalThis, name, {
      value,
      writable: true,
      enumerable: false,
      configurable: false,
    });
  }
}
