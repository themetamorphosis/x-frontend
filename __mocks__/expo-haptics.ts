export const impactAsync = jest.fn(() => Promise.resolve());
export const notificationAsync = jest.fn(() => Promise.resolve());
export const selectionAsync = jest.fn(() => Promise.resolve());

export enum ImpactFeedbackStyle {
  Light = 0,
  Medium = 1,
  Heavy = 2,
}

export enum NotificationFeedbackType {
  Success = 0,
  Warning = 1,
  Error = 2,
}
