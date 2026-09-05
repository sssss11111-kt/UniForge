export const authorizeSender = (sender: { isDestroyed(): boolean }): boolean =>
  !sender.isDestroyed();
