import yaml from 'js-yaml';

export type ParseResult =
  | { ok: true; data: unknown; format: 'json' | 'yaml'; hint?: string }
  | { ok: false; error: string };

// Fix common Chinese punctuation to ASCII for JSON/YAML
function fixChinesePunctuation(text: string): string {
  return text
    .replace(/[“”「」『』]/g, '"') // Chinese quotes → "
    .replace(/[，]/g, ',')  // full-width comma → ,
    .replace(/[：]/g, ':')  // full-width colon → :
    .replace(/[；]/g, ';')  // full-width semicolon → ;
    .replace(/[［]/g, '[')  // full-width bracket
    .replace(/[］]/g, ']')
    .replace(/[｛]/g, '{')
    .replace(/[｝]/g, '}');
}

// Make JSON-like content more resilient: wrap bare keys, add missing commas, fix trailing commas
function makeJsonFriendly(text: string): string {
  let t = text.trim();

  // If it doesn't start with { or [, wrap bare key:value content
  if (!/^[\{\[]/.test(t)) {
    t = '{\n' + t + '\n}';
  } else {
    // Ensure opening brace is on its own line
    t = t.replace(/^(\s*)([\{\[])/, '$2\n');
    t = t.replace(/([\}\]])\s*$/, '\n$1');
  }

  // Split into lines
  const lines = t.split('\n');

  // Detect lines that look like JSON properties: start with " or word, contain :
  const isProp = (line: string) => /^\s*["\w]/.test(line) && /:/.test(line);

  // Add missing commas: if a property line is NOT followed by a line that
  // starts with , or ends with , or is a closing brace, add comma
  const fixed: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const next = lines[i + 1];

    if (isProp(line)) {
      // Remove existing trailing comma
      line = line.replace(/,\s*$/, '');
      // Check if comma is needed before the next line
      if (next !== undefined) {
        const nextTrimmed = next.trim();
        const nextIsBrace = /^[\}\]]/.test(nextTrimmed);
        const nextIsProp = isProp(nextTrimmed);
        const nextIsComma = /^,/.test(nextTrimmed);
        if ((nextIsProp || nextIsBrace) && !nextIsComma) {
          // Need to decide: add comma or not
          // Don't add before closing brace (trailing comma issue)
          if (nextIsProp) {
            line += ',';
          }
        }
      }
    }

    fixed.push(line);
  }

  t = fixed.join('\n');

  // Fix trailing comma before closing brace/bracket
  t = t.replace(/,\s*([\}\]])/g, '$1');

  return t;
}

export function parse(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: 'Input is empty' };
  }

  // Auto-fix common Chinese punctuation
  const cleaned = fixChinesePunctuation(trimmed);
  const friendly = makeJsonFriendly(cleaned);

  // Determine what was fixed for the hint
  const hints: string[] = [];
  if (cleaned !== trimmed) hints.push('Chinese punctuation auto-fixed to ASCII');
  if (friendly !== cleaned) {
    if (!/^[\{\[]/.test(cleaned)) hints.push('wrapped in { }');
    else hints.push('missing commas added, trailing commas removed');
  }

  const hint = hints.length > 0 ? hints.join('; ') : undefined;

  // Try all variants
  const variants = [trimmed, cleaned, friendly];
  let jsonErr = '';

  for (const input of variants) {
    try {
      const data = JSON.parse(input);
      if (data !== null && typeof data === 'object') {
        return { ok: true, data, format: 'json', hint };
      }
      return { ok: false, error: 'Input must be a JSON object or array, like {"key":"value"} or [1,2,3]' };
    } catch (e) {
      jsonErr = e instanceof Error ? e.message : String(e);
    }

    try {
      const data = yaml.load(input);
      if (data !== null && typeof data === 'object') {
        return { ok: true, data, format: 'yaml', hint };
      }
    } catch {
      // continue
    }
  }

  return { ok: false, error: `Cannot parse as JSON or YAML.\n\nJSON error: ${jsonErr}\n\nMake sure you use English quotes "" and commas , not Chinese ones.` };
}

export function normalize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}
