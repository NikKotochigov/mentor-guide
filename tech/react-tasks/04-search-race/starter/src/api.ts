export type User = { id: number; name: string };

const ALL_USERS: User[] = [
  { id: 1, name: "Ada Lovelace" },
  { id: 2, name: "Alan Turing" },
  { id: 3, name: "Grace Hopper" },
  { id: 4, name: "Linus Torvalds" },
  { id: 5, name: "Brendan Eich" },
  { id: 6, name: "Dan Abramov" },
  { id: 7, name: "Sophie Alpert" },
  { id: 8, name: "Ryan Florence" },
  { id: 9, name: "Kent C. Dodds" },
  { id: 10, name: "React Router" },
];

export function fetchUsers(query: string, signal?: AbortSignal): Promise<User[]> {
  const delay = 300 + Math.floor(Math.random() * 1200);
  console.log("fetch start", query, `delay ${delay}ms`);

  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onAbort = () => {
      if (timer !== undefined) clearTimeout(timer);
      console.log("fetch abort", query);
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      const q = query.toLowerCase();
      const data = ALL_USERS.filter((u) => u.name.toLowerCase().includes(q));
      console.log("fetch done", query, data.length);
      resolve(data);
    }, delay);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
