/**
 * Parse a Java `.properties` payload, per `java.util.Properties.load`.
 *
 * Not plain `key=value` text. Delimiters are escaped, so a commit message
 * containing `(#2286)` is stored as `(\#2286)`. Entries may continue across
 * lines with a trailing backslash, and values carry escapes like `\uXXXX`.
 * Reading it as plain text leaves stray backslashes and truncates values.
 */
export function parseProperties(body: string): Record<string, string> {
  const properties: Record<string, string> = {};

  for (const line of toLogicalLines(body)) {
    const { key, value } = splitEntry(line);
    const unescapedKey = unescape(key);

    if (unescapedKey !== '') {
      properties[unescapedKey] = unescape(value);
    }
  }

  return properties;
}

/** Space, tab and form feed are whitespace in this format. Not line terminators. */
function isWhitespace(char: string | undefined): boolean {
  return char === ' ' || char === '\t' || char === '\f';
}

function skipWhitespace(line: string, from: number): number {
  let index = from;
  while (index < line.length && isWhitespace(line[index])) {
    index++;
  }
  return index;
}

function stripLeadingWhitespace(line: string): string {
  return line.slice(skipWhitespace(line, 0));
}

/**
 * A line continues onto the next only if it ends with an *odd* number of
 * backslashes. An even number encodes literal backslashes and terminates the
 * entry.
 */
function continuesOntoNextLine(line: string): boolean {
  let backslashes = 0;
  for (let index = line.length - 1; index >= 0 && line[index] === '\\'; index--) {
    backslashes++;
  }
  return backslashes % 2 === 1;
}

/**
 * Collapse natural lines into logical entries, dropping blanks and comments.
 * Comments cannot be continued, so each one is discarded on its own.
 */
function toLogicalLines(body: string): string[] {
  const logicalLines: string[] = [];
  let pending: string | null = null;

  for (const naturalLine of body.split(/\r\n|\r|\n/)) {
    const line = stripLeadingWhitespace(naturalLine);

    if (pending === null) {
      if (line === '' || line.startsWith('#') || line.startsWith('!')) {
        continue;
      }

      if (continuesOntoNextLine(line)) {
        pending = line.slice(0, -1);
      } else {
        logicalLines.push(line);
      }

      continue;
    }

    // Leading whitespace on a continuation line is discarded.
    if (continuesOntoNextLine(line)) {
      pending += line.slice(0, -1);
    } else {
      logicalLines.push(pending + line);
      pending = null;
    }
  }

  // A trailing continuation at end of input still yields an entry.
  if (pending !== null) {
    logicalLines.push(pending);
  }

  return logicalLines;
}

/**
 * Split a logical line into its raw key and value.
 *
 * The key ends at the first unescaped `=`, `:` or whitespace. Whitespace
 * around the separator is discarded. A line with no separator is a key with an
 * empty value.
 */
function splitEntry(line: string): { key: string; value: string } {
  for (let index = 0; index < line.length; index++) {
    const char = line[index];

    if (char === '\\') {
      index++; // Escaped character cannot be a separator.
      continue;
    }

    if (char === '=' || char === ':') {
      return {
        key: line.slice(0, index),
        value: line.slice(skipWhitespace(line, index + 1)),
      };
    }

    if (isWhitespace(char)) {
      let valueStart = skipWhitespace(line, index);

      // An `=` or `:` after the gap is the separator, not part of the value.
      if (line[valueStart] === '=' || line[valueStart] === ':') {
        valueStart = skipWhitespace(line, valueStart + 1);
      }

      return { key: line.slice(0, index), value: line.slice(valueStart) };
    }
  }

  return { key: line, value: '' };
}

/**
 * Apply escape processing.
 *
 * Per the format: `\t`, `\n`, `\r`, `\f` and `\uXXXX` are recognised, octal
 * escapes are not, and a backslash before any other character is dropped while
 * the character is kept (so `\#` yields `#` and `\b` yields `b`).
 */
function unescape(input: string): string {
  let result = '';

  for (let index = 0; index < input.length; index++) {
    const char = input[index];

    if (char !== '\\') {
      result += char;
      continue;
    }

    const escaped = input[index + 1];
    if (escaped === undefined) {
      break; // Trailing lone backslash is dropped.
    }

    index++;

    switch (escaped) {
      case 't':
        result += '\t';
        break;
      case 'n':
        result += '\n';
        break;
      case 'r':
        result += '\r';
        break;
      case 'f':
        result += '\f';
        break;
      case 'u': {
        const hex = input.slice(index + 1, index + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          result += String.fromCharCode(parseInt(hex, 16));
          index += 4;
        } else {
          result += 'u'; // Malformed escape: drop the backslash, keep the text.
        }
        break;
      }
      default:
        result += escaped;
    }
  }

  return result;
}
