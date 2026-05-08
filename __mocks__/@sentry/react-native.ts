const Sentry = {
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setExtra: jest.fn(),
  withScope: jest.fn((cb: (scope: any) => void) => {
    cb({
      setTag: jest.fn(),
      setExtra: jest.fn(),
      setUser: jest.fn(),
    });
  }),
  ReactNavigationInstrumentation: jest.fn(),
  ReactNativeTracing: jest.fn(),
};

export = Sentry;
