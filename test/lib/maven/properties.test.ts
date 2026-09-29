import { parseProperties } from '@/lib/maven/properties';
import { describe, expect, it } from 'vitest';

describe('parseProperties', () => {
  it('returns no entries for empty input', () => {
    expect(parseProperties('')).toEqual({});
  });

  it('reads an equals-separated entry', () => {
    expect(parseProperties('name=value')).toEqual({ name: 'value' });
  });

  it('reads a colon-separated entry', () => {
    expect(parseProperties('name:value')).toEqual({ name: 'value' });
  });

  it('reads a whitespace-separated entry', () => {
    expect(parseProperties('name value')).toEqual({ name: 'value' });
  });

  it('ignores whitespace surrounding a separator', () => {
    expect(parseProperties('name \t= \tvalue')).toEqual({ name: 'value' });
  });

  it('keeps equals signs in values', () => {
    expect(parseProperties('name=one=two')).toEqual({ name: 'one=two' });
  });

  it('reads a key without a separator as an empty value', () => {
    expect(parseProperties('name')).toEqual({ name: '' });
  });

  it('decodes escaped separators in a key', () => {
    expect(parseProperties(String.raw`a\:b\=c=value`)).toEqual({ 'a:b=c': 'value' });
  });

  it('decodes escaped whitespace in a key', () => {
    expect(parseProperties(String.raw`a\ b=value`)).toEqual({ 'a b': 'value' });
  });

  it('decodes escaped hash and colon in a value', () => {
    expect(parseProperties(String.raw`message=feat\: thing (\#180)`)).toEqual({
      message: 'feat: thing (#180)',
    });
  });

  it('treats an escaped hash at the start as a key', () => {
    expect(parseProperties(String.raw`\#key=value`)).toEqual({ '#key': 'value' });
  });

  it('joins lines ending in an odd number of backslashes', () => {
    expect(parseProperties('message=first\\\n  second')).toEqual({ message: 'firstsecond' });
  });

  it('preserves a literal backslash when a line ends in two backslashes', () => {
    expect(parseProperties('message=first\\\\\nnext=value')).toEqual({
      message: 'first\\',
      next: 'value',
    });
  });

  it('continues across multiple natural lines', () => {
    expect(parseProperties('message=one\\\n two\\\n three')).toEqual({ message: 'onetwothree' });
  });

  it('accepts a trailing continuation at end of input', () => {
    expect(parseProperties('message=one\\')).toEqual({ message: 'one' });
  });

  it('decodes unicode escape sequences', () => {
    expect(parseProperties(String.raw`word=Gr\u00FCn`)).toEqual({ word: 'Grün' });
  });

  it('keeps malformed unicode text after dropping its escape slash', () => {
    expect(parseProperties(String.raw`word=\u12xz`)).toEqual({ word: 'u12xz' });
  });

  it('keeps incomplete unicode text after dropping its escape slash', () => {
    expect(parseProperties(String.raw`word=\u12`)).toEqual({ word: 'u12' });
  });

  it('drops slashes from unrecognised escapes', () => {
    expect(parseProperties(String.raw`word=\q\8`)).toEqual({ word: 'q8' });
  });

  it('decodes tab, newline, carriage return, and form feed escapes', () => {
    expect(parseProperties(String.raw`word=a\tb\nc\rd\fe`)).toEqual({ word: 'a\tb\nc\rd\fe' });
  });

  it('accepts CRLF line endings', () => {
    expect(parseProperties('first=one\r\nsecond=two\r\n')).toEqual({ first: 'one', second: 'two' });
  });

  it('accepts carriage-return line endings', () => {
    expect(parseProperties('first=one\rsecond=two')).toEqual({ first: 'one', second: 'two' });
  });

  it('ignores empty and whitespace-only lines', () => {
    expect(parseProperties('\n \t\nname=value\n')).toEqual({ name: 'value' });
  });

  it('ignores both kinds of comment line', () => {
    expect(parseProperties('# first\n ! second\nname=value')).toEqual({ name: 'value' });
  });

  it('does not continue a comment into the next entry', () => {
    expect(parseProperties('# comment\\\nname=value')).toEqual({ name: 'value' });
  });

  it('replaces an earlier value when a key repeats', () => {
    expect(parseProperties('name=old\nname=new')).toEqual({ name: 'new' });
  });
});
