import axios from 'axios';
import axiosInstance from './axiosInstance';

// Mock axios since axiosInstance creates an instance of it
// We need to verify that axiosInstance has the interceptors attached
// However, testing interceptors usually involves mocking the underlying axios adapter or mocking the instance itself.
// Since axiosInstance is exported as a default instance, we can spy on it or test its behavior by making requests if we mock the adapter.

// A better approach for testing interceptors in isolation is tricky without extracting them.
// But we can test the behavior of axiosInstance by mocking the response of axios.

jest.mock('axios', () => {
    const originalAxios = jest.requireActual('axios');
    return {
        ...originalAxios,
        create: jest.fn(() => {
            const instance: any = {
                interceptors: {
                    request: { use: jest.fn(), eject: jest.fn() },
                    response: { use: jest.fn(), eject: jest.fn() }
                },
                get: jest.fn(),
                post: jest.fn(),
                // Add other methods if needed
            };
            return instance;
        }),
    };
});

// Since we can't easily access the interceptor callbacks directly from the mocked instance because they are registered inside the module,
// we might need to change how we test this.
//
// Alternatively, we can rely on `nock` or `axios-mock-adapter` for integration style testing, but for unit testing,
// it is better if we can export the interceptors or logic.
//
// However, looking at the code in `src/lib/axiosInstance.ts`, it directly modifies the instance created by `axios.create`.
//
// Let's inspect the `axiosInstance` object exported.
// The `axios.create` mock above returns a mock object, but `axiosInstance` variable in the module captures it.
//
// We need to capture the callbacks passed to `use`.

describe('axiosInstance', () => {
  let responseSuccessInterceptor: any;
  let responseErrorInterceptor: any;

  beforeAll(() => {
     // We need to re-require the module to ensure the mock is used and we capture interceptors
     jest.isolateModules(() => {
        const mockedAxios = require('axios');
        // We need the create mock to store the interceptors so we can access them
        const interceptorHandlers = {
            onFulfilled: null,
            onRejected: null
        };

        mockedAxios.create.mockImplementation(() => ({
            defaults: { headers: { common: {} } },
            interceptors: {
                request: { use: jest.fn() },
                response: {
                    use: jest.fn((onFulfilled, onRejected) => {
                        interceptorHandlers.onFulfilled = onFulfilled;
                        interceptorHandlers.onRejected = onRejected;
                        return 1; // Interceptor ID
                    })
                }
            }
        }));

        require('./axiosInstance');
        responseSuccessInterceptor = interceptorHandlers.onFulfilled;
        responseErrorInterceptor = interceptorHandlers.onRejected;
     });
  });

  it('should unwrap data when ok is true', async () => {
    const response = {
        data: {
            ok: true,
            data: { foo: 'bar' }
        },
        status: 200,
    };

    const result = await responseSuccessInterceptor(response);
    expect(result).toEqual({ ...response, data: { foo: 'bar' } });
  });

  it('should throw wrapped error when ok is false', async () => {
    const response = {
        data: {
            ok: false,
            error: {
                code: 'TEST_ERROR',
                message: 'Test message',
                status: 400
            }
        },
        status: 200,
    };

    try {
        await responseSuccessInterceptor(response);
        fail('Should have thrown an error');
    } catch (error: any) {
        // The implementation uses res.status if available, so it takes 200 from the response object
        // status: res?.status ?? body.error.status ?? 500
        expect(error).toMatchObject({
            isApiError: true,
            code: 'TEST_ERROR',
            message: 'Test message',
            status: 200
        });
    }
  });

  it('should throw 404 error when status is 404', async () => {
      const error = {
          response: {
              status: 404,
              data: null
          }
      };

      try {
          await responseErrorInterceptor(error);
          fail('Should have thrown an error');
      } catch (err: any) {
           expect(err).toMatchObject({
              isApiError: true,
              code: 'NOT_FOUND',
              status: 404
           });
      }
  });

  it('should throw network timeout error', async () => {
      const error = {
          code: 'ECONNABORTED'
      };
      try {
        await responseErrorInterceptor(error);
        fail('Should have thrown an error');
      } catch(err: any) {
          expect(err).toMatchObject({
              isApiError: true,
              code: 'NETWORK_TIMEOUT',
              status: 408
          });
      }
  });

   it('should throw generic network error', async () => {
      const error = {
          message: 'Network Error'
      };
      try {
        await responseErrorInterceptor(error);
        fail('Should have thrown an error');
      } catch(err: any) {
          expect(err).toMatchObject({
              isApiError: true,
              code: 'NETWORK_ERROR',
              status: 0
          });
      }
  });
});
