import { parseRegisterErrorMessages } from './registerFormValidation';

describe('registerFormValidation', () => {
  it('should return known error message', () => {
    const result = parseRegisterErrorMessages('password_too_short');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Hasło musi mieć min. 8 znaków");
  });

  it('should return default message with code for unknown error', () => {
    const code = 'some_random_error';
    const result = parseRegisterErrorMessages(code);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe(code);
    expect(result[0].type).toBe('Dismiss');
  });

  it('should return empty array for undefined code', () => {
    const result = parseRegisterErrorMessages(undefined);
    expect(result).toEqual([]);
  });
});
