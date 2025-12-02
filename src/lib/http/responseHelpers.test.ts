import { handleSuccess, handleError } from './responseHelpers';
import { NextResponse } from 'next/server';

// Mock NextResponse.json since it's not fully supported in jsdom environment or behaves differently
jest.mock('next/server', () => {
    return {
        NextResponse: {
            json: jest.fn((data: any, init?: any) => {
                return new Response(JSON.stringify(data), {
                     ...init,
                     headers: { 'Content-Type': 'application/json', ...init?.headers }
                });
            })
        }
    };
});

describe('responseHelpers', () => {
  describe('handleSuccess', () => {
    it('should return a NextResponse with correct data and status', async () => {
      const data = { id: 1, name: 'Test' };
      const status = 201;

      const response = handleSuccess(data, status);
      const json = await response.json();

      // expect(response).toBeInstanceOf(NextResponse); // We are mocking NextResponse now
      expect(response.status).toBe(status);
      expect(json).toEqual({ ok: true, data });
    });

    it('should use default status 200', async () => {
        const data = { foo: 'bar' };
        const response = handleSuccess(data);
        expect(response.status).toBe(200);
    });
  });

  describe('handleError', () => {
    it('should return a NextResponse with correct error structure and status', async () => {
      const code = 'ERROR_CODE';
      const message = 'Something went wrong';
      const data = { details: 'info' };
      const status = 400;

      const response = handleError(code, message, data, status);
      const json = await response.json();

      // expect(response).toBeInstanceOf(NextResponse); // We are mocking NextResponse now
      expect(response.status).toBe(status);
      expect(json).toEqual({
        ok: false,
        error: { code, data },
      });
    });

    it('should use default status 500', async () => {
        const code = 'SERVER_ERROR';
        const message = 'Server error';
        const response = handleError(code, message);
        expect(response.status).toBe(500);
    });
  });
});
