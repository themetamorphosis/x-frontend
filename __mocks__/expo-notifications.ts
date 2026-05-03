export const requestPermissionsAsync = jest.fn(() => Promise.resolve({ granted: true }));
export const getExpoPushTokenAsync = jest.fn(() => Promise.resolve({ data: "ExponentPushToken[test]" }));
export const setNotificationHandler = jest.fn();
export const addNotificationReceivedListener = jest.fn(() => ({ remove: jest.fn() }));
export const addNotificationResponseReceivedListener = jest.fn(() => ({ remove: jest.fn() }));
