import { describe, expect, it } from 'vitest';
import { MAX_BYTES, validateFile } from './Dropzone';

function file(name: string, type: string, size = 1024): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('validateFile', () => {
  it.each([
    ['bill.pdf', 'application/pdf'],
    ['bill.jpg', 'image/jpeg'],
    ['bill.jpeg', 'image/jpeg'],
    ['bill.png', 'image/png'],
    ['BILL.PDF', 'application/pdf'],
  ])('accepts %s', (name, type) => {
    expect(validateFile(file(name, type))).toBeNull();
  });

  it.each([
    ['notes.txt', 'text/plain'],
    ['sheet.csv', 'text/csv'],
    ['archive.zip', 'application/zip'],
  ])('rejects %s', (name, type) => {
    expect(validateFile(file(name, type))).toMatch(/not a supported file/i);
  });

  it('accepts a file whose type is empty but whose extension is right', () => {
    expect(validateFile(file('bill.pdf', ''))).toBeNull();
  });

  it('rejects anything over the size limit', () => {
    expect(validateFile(file('bill.pdf', 'application/pdf', MAX_BYTES + 1))).toMatch(/10 MB/);
  });

  it('accepts a file exactly at the limit', () => {
    expect(validateFile(file('bill.pdf', 'application/pdf', MAX_BYTES))).toBeNull();
  });

  it('names the offending file so the message is actionable', () => {
    expect(validateFile(file('notes.txt', 'text/plain'))).toContain('notes.txt');
  });
});
