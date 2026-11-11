# Решение: поиск с гонкой запросов

```tsx
import { useEffect, useState } from "react";
import { fetchUsers, type User } from "./api";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setUsers([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchUsers(debouncedQuery, controller.signal)
      .then((data) => setUsers(data))
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (e && typeof e === "object" && "name" in e && e.name === "AbortError") {
          return;
        }
        setError("Не удалось загрузить");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && <p>Загрузка...</p>}
      {error && <p>{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Подробный разбор

1. Гонка запросов: ответ на "rea" может прийти позже ответа на "react" и перезаписать список. Лечится отменой прошлого запроса (`AbortController`) в cleanup эффекта. Cleanup срабатывает до следующего эффекта.
2. Нет дебаунса: выносим в `useDebounce`, эффект зависит от `debouncedQuery`.
3. При пустом query нельзя делать ранний `return` без сброса: нужно чистить список.
4. `setState` после unmount: тот же abort в cleanup. `AbortError` - не ошибка для пользователя, её игнорируем.

## Вопросы для обсуждения

1. Почему cleanup эффекта решает гонку?

   Ответ: перед новым эффектом React вызывает cleanup предыдущего. Там мы абортим прошлый запрос, и его `then` либо не вызовется, либо попадёт в `AbortError`, который мы игнорируем. На экран попадёт только ответ актуального query.

2. Чем хуже флаг `ignore` без `AbortController`?

   Ответ: устаревший ответ просто не запишется в state, но сам запрос всё равно летит и занимает сеть. С `AbortSignal` его можно отменить, если бэкенд это умеет.

3. Почему в Strict Mode в dev запрос уходит дважды, и это нормально?

   Ответ: в разработке React монтирует, размонтирует и монтирует компонент ещё раз, чтобы поймать неубранные подписки. Cleanup должен отменить первый запрос. В проде двойного вызова нет.

4. Как то же самое решают TanStack Query и `useDeferredValue`?

   Ответ: в Query ключ запроса и `signal` в `queryFn` отменяют прошлый fetch автоматически. `useDeferredValue` не отменяет запрос, а откладывает отрисовку списка, чтобы инпут оставался отзывчивым. Это другая задача.

5. Что делать, если API не умеет `AbortSignal`?

   Ответ: оставить флаг `ignore` (или счётчик поколения) в cleanup, чтобы игнорировать устаревший ответ. Запрос дойдёт до сервера, но UI не сломается.

**На что смотреть:** есть ли дебаунс; отменяется ли прошлый запрос в cleanup; очищается ли список на пустой query; не показывается ли `AbortError` как ошибка.
