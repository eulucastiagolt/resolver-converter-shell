import { describe, expect, test } from 'bun:test';
import { convertMultiple } from '../src/converter';

describe('convertMultiple', () => {
  test('reports the input pattern when no files match', async () => {
    const input = '__rconv_missing_input__*.mp4';
    let reportedError: Error | undefined;

    const [result] = await convertMultiple({
      input,
      output: './output',
      onError: (_file, error) => {
        reportedError = error;
      },
    });

    expect(result.input).toBe(input);
    expect(result.output).toBe('');
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain(`No files found matching pattern: ${input}`);
    expect(reportedError?.message).toContain('Working directory:');
  });
});
