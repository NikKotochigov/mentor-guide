export type User = { id: string; name: string };

export function fetchUser(id: string): Promise<User> {
  console.log("fetch", id);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: `User ${id}` }), 500);
  });
}
