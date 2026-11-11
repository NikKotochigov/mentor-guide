export function useOptimisticState<T>(
  initial: T
): [T, boolean, (next: T, request: () => Promise<void>) => void] {
  // TODO: сразу показывай next, в случае ошибки верни значение, которое было до клика
  const run = (_next: T, _request: () => Promise<void>) => {
    throw new Error("TODO: реализуй useOptimisticState");
  };
  return [initial, false, run];
}
