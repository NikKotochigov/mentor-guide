export function saveLike(next: number, shouldFail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Сеть недоступна"));
      else resolve();
    }, 1000);
  });
}
