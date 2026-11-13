/*
  useLocalStorage без рассинхрона (30-40 минут)

  Нужен хук useLocalStorage(key, initialValue), чтобы хранить
  значение в localStorage. Ниже уже есть заготовка и демо:
  настройки имени и темы плюс отдельный предпросмотр.
  Заготовка работает с ошибками.

  Что сделать:
  - значение переживает перезагрузку страницы;
  - два компонента с одним и тем же key показывают одно
    значение и обновляются вместе;
  - изменение в другой вкладке того же сайта тоже подхватывается;
  - источником правды должен быть localStorage, а не копия в useState.

  Компоненты демо менять не нужно, правь только хук.

  Как проверить:
  - в блоке "Настройки" меняешь имя: в "Предпросмотр"
    оно появляется сразу, без перезагрузки;
  - переключаешь тему: фон страницы и подпись в предпросмотре
    меняются вместе;
  - перезагрузка страницы оставляет имя и тему на месте;
  - если открыть то же демо во второй вкладке, изменение
    имени или темы сразу видно и там.
*/

import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // TODO: исправь баги
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
