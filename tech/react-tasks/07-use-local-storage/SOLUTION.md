# Решение: useLocalStorage без рассинхрона

Источник идеи: официальный хук [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore). Там же разобран похожий случай: подписка на значение браузера, которое меняется без ведома React, на примере `navigator.onLine`. Здесь внешний стор - `localStorage`. Событие `storage` не приходит в то окно, которое само записало значение, это описано в [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event).

```tsx
import { useCallback, useSyncExternalStore } from "react";

const LOCAL_CHANGE = "mentor-local-storage";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) onStoreChange();
      };
      const onLocal = (e: Event) => {
        if ((e as CustomEvent<string>).detail === key) onStoreChange();
      };

      window.addEventListener("storage", onStorage);
      window.addEventListener(LOCAL_CHANGE, onLocal);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(LOCAL_CHANGE, onLocal);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => localStorage.getItem(key), [key]);
  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let value = initialValue;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initialValue;
    }
  }

  const setValue = useCallback(
    (next: T) => {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(LOCAL_CHANGE, { detail: key }));
    },
    [key],
  );

  return [value, setValue];
}

function Settings() {
  const [name, setName] = useLocalStorage("react-task-name", "");
  const [theme, setTheme] = useLocalStorage<"light" | "dark">(
    "react-task-theme",
    "light",
  );

  return (
    <section>
      <h2 style={{ fontSize: 16 }}>Настройки</h2>
      <p>
        <label>
          Имя{" "}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </p>
      <p>
        Тема:{" "}
        <button
          onClick={() => setTheme("light")}
          disabled={theme === "light"}
          style={{ marginRight: 8 }}
        >
          Светлая
        </button>
        <button onClick={() => setTheme("dark")} disabled={theme === "dark"}>
          Тёмная
        </button>
      </p>
    </section>
  );
}

function Preview() {
  const [name] = useLocalStorage("react-task-name", "");
  const [theme] = useLocalStorage<"light" | "dark">(
    "react-task-theme",
    "light",
  );

  return (
    <section>
      <h2 style={{ fontSize: 16 }}>Предпросмотр</h2>
      <p>Имя: {name || "не задано"}</p>
      <p>Тема: {theme === "dark" ? "тёмная" : "светлая"}</p>
    </section>
  );
}

export function App() {
  const [theme] = useLocalStorage<"light" | "dark">(
    "react-task-theme",
    "light",
  );
  const dark = theme === "dark";

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "sans-serif",
        minHeight: "100vh",
        background: dark ? "#1e1e1e" : "#ffffff",
        color: dark ? "#f5f5f5" : "#111111",
      }}
    >
      <h1 style={{ fontSize: 20, margin: "0 0 16px" }}>Профиль</h1>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Settings />
        <Preview />
      </div>
    </div>
  );
}

export default App;
```

`localStorage` считается внешним стором: React сам не знает, когда его изменили. `useSyncExternalStore` подписывается на изменения, читает снимок через `getSnapshot` и перерисовывает только те компоненты, у которых значение по `Object.is` реально поменялось. Для той же вкладки после `setItem` нужно самим отправить событие, потому что нативное `storage` туда не приходит.

## Подробный разбор

**Почему заготовка ломается.**
У каждого вызова хука свой `useState`. `Settings`, `Preview` и `App` держат три независимые копии. Эффект пишет в `localStorage` после рендера, но соседние компоненты об этом не узнают: события нет, стейт у них свой. Поэтому имя в предпросмотре не меняется, фон страницы остаётся светлым. После перезагрузки все читают storage заново и на миг выглядят синхронными, пока снова не начнёшь печатать. Другая вкладка тоже молчит: на `storage` никто не подписан.

Можно починить это через `useState` плюс `useEffect` с двумя слушателями. Так тоже проходит проверка, но появляется вторая копия данных и лишний рендер после записи. Для внешнего стора как раз и сделан `useSyncExternalStore`.

**Зачем сырая строка в `getSnapshot`.**
Хук сравнивает снимки через `Object.is`. Если каждый раз возвращать `JSON.parse(...)`, для объекта или массива получится новая ссылка, даже когда строка в storage не менялась. React решит, что стор обновился, и уйдёт в бесконечный ререндер. Строка из `getItem` стабильна, пока ключ не записали заново. Разбор JSON лучше делать уже после хука, во время рендера.

**Два события, а не одно.**
`storage` приходит только в другие вкладки того же origin. В той вкладке, где вызвали `setItem`, его не будет. Поэтому после записи хук сам шлёт `mentor-local-storage` с ключом в `detail`. Подписка слушает оба события и вызывает `onStoreChange` только для своего ключа. `e.key === null` нужен на случай `localStorage.clear()` из другой вкладки.

**Стабильный `subscribe` и `getServerSnapshot`.**
Если передавать в хук новую функцию `subscribe` на каждом рендере, React будет отписываться и подписываться заново. `useCallback` с `[key]` этого не делает, пока ключ тот же. `getServerSnapshot` возвращает `null`, чтобы на сервере не трогать `localStorage` и не словить рассинхрон гидратации. В StackBlitz серверного рендера нет, но без этого аргумента SSR-приложение упадет.

## Вопросы для обсуждения

1. Почему нельзя обойтись одной подпиской на событие `storage`?

   Ответ: браузер специально не шлёт его в то окно, которое сделало запись. Соседние компоненты на этой же странице его не увидят. Для своей вкладки нужно своё событие после `setItem`.

2. Что будет, если `getSnapshot` каждый раз делает `JSON.parse` и возвращает объект?

   Ответ: `Object.is` сравнивает ссылки. Новый объект на каждый вызов выглядит как изменение стора, и React начинает бесконечные ререндеры. Нужно возвращать неизменяемый снимок, который тот же самый, пока данные не поменялись. Для `localStorage` это сама строка.

3. Чем `useSyncExternalStore` лучше связки `useState` + `useEffect`?

   Ответ: стор один, копии в стейте нет. Нет кадра, где на экране уже новое значение в одном месте и старое в другом. Хук как раз для внешних данных, которые меняются помимо React, в том числе в concurrent-рендере. Эффект с слушателями может пройти проверку, но это две правды и лишний рендер после записи.

4. Зачем выносить `subscribe` в `useCallback` или вообще за пределы компонента?

   Ответ: React переподписывается, если функция `subscribe` сменилась. На каждый рендер это лишние add/remove listener. Пока `key` тот же, функция должна быть той же.

**На что смотреть:** стал ли `localStorage` источником правды, а не копией в `useState`; есть ли подписка и на другую вкладку, и на запись в этой же; не возвращает ли `getSnapshot` новый объект на каждый вызов; чистится ли подписка; не правил ли кандидат демо вместо хука, например через общий стейт в `App`.
