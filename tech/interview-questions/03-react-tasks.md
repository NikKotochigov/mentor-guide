# React: задачи

Условие и решение — кодом. Незаполненное место помечено `TODO`.

---

## 1. `useFirstRender`

```tsx
/*
Реализовать хук useFirstRender.

Должен вернуть:
- true на самом первом рендере компонента
- false на всех следующих рендерах
*/

function useFirstRender(): boolean {
  // TODO
}

function Demo() {
  const isFirst = useFirstRender();
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      {isFirst ? "первый рендер" : `рендер #${count + 1}`}
    </button>
  );
}
```

```tsx
// Решение
// Нельзя писать isFirst.current = false прямо в теле рендера:
// в React Strict Mode (dev) компонент вызывается дважды —
// второй вызов уже видит false, на экране сразу «рендер #1».

import { useEffect, useRef } from "react";

function useFirstRender(): boolean {
  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return isFirst.current;
}
```

---

## 2. `PleaseReviewMe` — найти неточности и отрефакторить

```tsx
/*
Найти неточности и отрефакторить.
*/

const PleaseReviewMe = () => {
  const [count, setCount] = React.useState(1);
  const [items, setItems] = React.useState([{ id: 1 }]);

  React.useLayoutEffect(() => {
    document.addEventListener("click", () => {
      setInterval(() => console.log(count), 1000);
    });
  });

  const click = React.useCallback(() => {
    setCount(count + 1);
    setItems([...items, { id: count + 1 }]);
  });

  return (
    <>
      Current count: {count}
      <ul>
        {items.map((item) => (
          <li>{item.id}</li>
        ))}
      </ul>
      <button onClick={() => click()}>add one</button>
    </>
  );
};
```

```tsx
// Решение
// - useLayoutEffect без deps → listener на каждый рендер (утечка); тут достаточно useEffect
// - анонимный listener → нельзя снять; interval на каждый клик без clear → утечка
// - console.log(count) в interval → stale closure; читаем актуальный count через ref
// - useCallback без deps бессмысленен; setState(count/items) → stale + риск при батчинге
// - нет key у <li>; onClick={() => click()} — лишняя обёртка

import React, { useCallback, useEffect, useRef, useState } from "react";

const PleaseReviewMe = () => {
  const [count, setCount] = useState(1);
  const [items, setItems] = useState([{ id: 1 }]);
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    let intervalId;

    const onDocumentClick = () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        console.log(countRef.current);
      }, 1000);
    };

    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      clearInterval(intervalId);
    };
  }, []);

  const click = useCallback(() => {
    setCount((c) => {
      const next = c + 1;
      setItems((prev) => [...prev, { id: next }]);
      return next;
    });
  }, []);

  return (
    <>
      Current count: {count}
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.id}</li>
        ))}
      </ul>
      <button onClick={click}>add one</button>
    </>
  );
};
```
