export const addEventListener = jest.fn(() => jest.fn());
export const fetch = jest.fn(() => Promise.resolve({ isConnected: true }));
