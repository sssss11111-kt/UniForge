export const validateNoPayload = (payload: unknown): void => {
  if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
};
