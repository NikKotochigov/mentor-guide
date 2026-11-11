/*
  Поиск с гонкой запросов (30-40 минут)

  Компонент поиска пользователей. На каждый ввод уходит запрос.
  Ниже рабочий, но бажный вариант. fetchUsers(query, signal) уже
  поддерживает AbortSignal. Ответы приходят в случайном порядке (300-1500 мс).

  Баги, на которые жалуется QA:
  1. Быстро печатаем "react" - иногда в списке результаты для "rea",
     хотя в инпуте уже "react".
  2. На каждую букву летит запрос, бэкенд ругается на нагрузку.
  3. Если очистить инпут, остаются старые результаты.
  4. Ушли со страницы во время запроса - ответ всё равно обрабатывается.

  Что сделать:
  - показывать результаты только для актуального query;
  - дебаунс 300 мс;
  - пустой query - пустой список без запроса;
  - отменять запрос при смене query и при unmount;
  - показать состояния loading и error.

  fetchUsers менять не нужно, правь только UserSearch.

  Как проверить (открой Console):
  - быстрый ввод "react": в списке результаты именно для "react",
    в консоли видно, что промежуточные запросы отменились;
  - запрос уходит не на каждую букву, а после паузы в 300 мс;
  - очистка инпута сразу очищает список и не делает запрос;
  - AbortError не показывается пользователю как ошибка.
*/

import { useEffect, useState } from "react";

// ---------- Фейковый API, менять не нужно ----------

type User = { id: number; name: string };

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

function fetchUsers(query: string, signal?: AbortSignal): Promise<User[]> {
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

// ---------- Задача ----------

function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  // TODO: найти и исправить баги
  useEffect(() => {
    if (!query) return;

    fetchUsers(query).then((data) => {
      setUsers(data);
    });
  }, [query]);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск"
      />
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return <UserSearch />;
}
