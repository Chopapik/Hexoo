import { generatePassword } from './generatePassword';

describe('generatePassword', () => {
  it('should generate a password with correct prefix and structure', () => {
    const username = 'testuser';
    const result = generatePassword(username);

    expect(result.password).toMatch(/^V8-\d+$/);
    expect(result.x).toBeGreaterThanOrEqual(1);
    expect(result.x).toBeLessThanOrEqual(100);
  });

  it('should generate deterministic rawValue based on x and username length', () => {
      // We can't easily force Math.random() without mocking, but we can verify the math property
      // rawValue = a * sin(1/x)
      const username = 'abc'; // length 3
      const result = generatePassword(username);

      const expectedRawValue = 3 * Math.sin(1 / result.x);
      expect(result.rawValue).toBeCloseTo(expectedRawValue);
  });

  it('should handle different username lengths', () => {
     const u1 = generatePassword('a');
     const u2 = generatePassword('aaaaa');

     expect(u1.password).toBeDefined();
     expect(u2.password).toBeDefined();
  });
});
