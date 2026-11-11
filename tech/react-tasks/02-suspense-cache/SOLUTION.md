# Решение: данные через Suspense

```tsx
type User = { id: string; name: string };

type Entry =
  | { status: "pending"; promise: Promise<void> }
  | { status: "success"; data: User }
  | { status: "error"; error: unknown };

const cache = new Map<string, Entry>();

function getUser(id: string): User {
  let entry = cache.get(id);

  if (!entry) {
    const promise = fetchUser(id).then(
      (data) => {
        cache.set(id, { status: "success", data });
      },
      (error) => {
        cache.set(id, { status: "error", error });
      }
    );
    entry = { status: "pending", promise };
    cache.set(id, entry);
  }

  if (entry.status === "pending") {
    throw entry.promise;
  }
  if (entry.status === "error") {
    throw entry.error;
  }
  return entry.data;
}

function useUser(id: string): User {
  return getUser(id);
}
```

## Подробный разбор

**Как это работает.**
Когда рендер бросает промис, ближайший `Suspense` ловит его и показывает fallback. Когда промис резолвится, React повторяет рендер, `getUser` уже достаёт данные из кэша и возвращает их: fallback сменяется профилем. Это происходит в фазе рендера, а не после отрисовки.

**Почему кэш снаружи компонента.**
Если создавать промис внутри `useUser` на каждом рендере, повтор после suspend создаст новый промис. Suspense будет ждать бесконечно, запросы пойдут один за другим. Кэш должен пережить отмену и повтор рендера, поэтому его держат на уровне модуля (или в отдельном хранилище, как в React Query).

## Вопросы для обсуждения

1. Чем это отличается от загрузки в `useEffect`?

   Ответ: `useEffect` выполняется после отрисовки, поэтому сначала пользователь видит пустой кадр или "загрузка" из state, потом контент. Suspense прерывает рендер до commit, и на экране сразу fallback, без промежуточного кадра.

2. Зачем в кэше хранить сам промис, а не только данные?

   Ответ: Suspense узнаёт, что ресурс готов, когда резолвится именно тот промис, который ему бросили. Если бросать каждый раз новый промис, граница не дождётся.

3. Как в React 19 можно написать то же самое короче? Что с ошибками?

   Ответ: хук `use(promise)` делает ту же механику: читает или приостанавливает. Кэш снаружи всё равно нужен. Ошибку, которую бросает `getUser`, ловит не Suspense, а ближайший Error Boundary.

**На что смотреть:** появился ли кэш вне компонента; бросается ли уже созданный промис, а не новый; не остался ли `useEffect`; понимает ли, почему возврат к id "1" не идёт в сеть.
