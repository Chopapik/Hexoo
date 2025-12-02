import { parseErrorMessages } from './loginFormValidation';

describe('loginFormValidation', () => {
  it('should return error message for known error code', () => {
    const result = parseErrorMessages('email_required');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: "Email jest wymagany",
      field: "email",
      type: "Dismiss",
    });
  });

  it('should return default error message for unknown error code', () => {
    const result = parseErrorMessages('unknown_code');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: "Wystąpił nieznany błąd",
      field: "root",
      type: "Dismiss",
    });
  });

  it('should return empty array if no error code provided', () => {
    const result = parseErrorMessages(undefined);
    expect(result).toEqual([]);
  });

  it('should handle INVALID_CREDENTIALS', () => {
      const result = parseErrorMessages('INVALID_CREDENTIALS');
      expect(result[0].text).toBe("Niepoprawne dane logowania");
  });
});
