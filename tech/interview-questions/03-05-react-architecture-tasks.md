# React + Архитектура и паттерны: задачи для Live-coding

Условие и решение — кодом. Незаполненное место или проблемный участок помечены `TODO`.

---

## 1. (React: Хуки и Strict Mode) `useFirstRender` и `usePrevious`

```tsx
/*
Реализовать два кастомных хука:
1) useFirstRender(): boolean — возвращает true только на самом первом рендере,
   а на всех последующих — false (должен корректно работать в React 18 Strict Mode).
2) usePrevious<T>(value: T): T | undefined — возвращает значение пропса/стейта
   с предыдущего рендера.
*/

import { useEffect, useRef } from "react";

export function useFirstRender(): boolean {
  // TODO
}

export function usePrevious<T>(value: T): T | undefined {
  // TODO
}
```

```tsx
// Решение
// В теле рендера менять ref.current напрямую нельзя:
// в React 18 Strict Mode (dev) функция компонента вызывается дважды подряд до коммита,
// поэтому мутация во время рендера сломает логику уже на первом экране.
// useEffect выполняется ПОСЛЕ коммита и отрисовки в браузере, поэтому во время рендера
// мы возвращаем старое значение ref.current, а в эффекте обновляем его для следующего рендера.

import { useEffect, useRef } from "react";

export function useFirstRender(): boolean {
  const isFirstRef = useRef(true);

  useEffect(() => {
    isFirstRef.current = false;
  }, []);

  return isFirstRef.current;
}

export function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    prevRef.current = value;
  }, [value]);

  return prevRef.current;
}
```

---

## 2. (React: Code Review) Найти 7 проблем в `PleaseReviewMe` и исправить

```tsx
/*
Провести код-ревью компонента, назвать все проблемы (утечки памяти, баги стейта,
stale closure, лишние рендеры, ключи) и переписать компонент правильно.
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
// 1. useLayoutEffect без массива зависимостей срабатывает после КАЖДОГО рендера и блокирует отрисовку.
// 2. document.addEventListener навешивает новую анонимную функцию на каждый рендер без removeEventListener (утечка памяти).
// 3. На каждый клик по документу запускается новый setInterval без clearInterval (лавинообразная утечка таймеров).
// 4. Внутри setInterval читается захваченный в замыкании старый count (Stale Closure).
// 5. useCallback без массива зависимостей пересоздаёт функцию на каждом рендере (бессмысленный хук).
// 6. setCount(count + 1) и setItems([...items, ...]) опираются на замкнутый стейт вместо функционального обновления.
// 7. У <li> отсутствует prop key.

import React, { useCallback, useEffect, useRef, useState } from "react";

export const PleaseReviewMe = () => {
  const [count, setCount] = useState(1);
  const [items, setItems] = useState([{ id: 1 }]);
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const handleDocumentClick = () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        console.log(countRef.current);
      }, 1000);
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      clearInterval(intervalId);
    };
  }, []);

  const handleAdd = useCallback(() => {
    setCount((prevCount) => {
      const nextCount = prevCount + 1;
      setItems((prevItems) => [...prevItems, { id: nextCount }]);
      return nextCount;
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
      <button onClick={handleAdd}>add one</button>
    </>
  );
};
```

---

## 3. (React: Асинхронность и Race Condition) Безопасный поиск с `useDebounce` и `AbortController`

```tsx
/*
Реализовать:
1) Хук useDebounce<T>(value: T, delay: number): T
2) Компонент поиска пользователей UserSearch, который:
   - ждёт 300 мс после ввода перед отправкой запроса;
   - отменяет предыдущий незавершённый fetch при вводе новой буквы или размонтировании (защита от Race Condition);
   - корректно обрабатывает состояния loading / error / data и не считает AbortError ошибкой.
*/

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
}

export function useDebounce<T>(value: T, delay: number): T {
  // TODO
}

export function UserSearch() {
  // TODO
}
```

```tsx
// Решение
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timerId);
  }, [value, delay]);

  return debounced;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 300);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!debouncedQuery) {
      setUsers([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`/api/users?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<User[]>;
      })
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск пользователя..."
      />
      {isLoading && <p>Загрузка...</p>}
      {error && <p role="alert">{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. (React: Оптимизация рендеров) Устранить лишние ре-рендеры тяжёлого списка

```tsx
/*
При каждом вводе символа в поле заметки (note) компонент ExpensiveList
заново перерендеривается, хотя список товаров items не менялся.
Почему React.memo на ExpensiveList сейчас НЕ спасает? Исправьте код.
*/

import React, { useState } from "react";

interface Item {
  id: string;
  title: string;
  category: string;
}

const ExpensiveList = React.memo(function ExpensiveList({
  items,
  onSelect,
}: {
  items: Item[];
  onSelect: (id: string) => void;
}) {
  console.log("Render ExpensiveList");
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.title}
        </li>
      ))}
    </ul>
  );
});

export function Catalog({ rawItems }: { rawItems: Item[] }) {
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // TODO: почему ExpensiveList рендерится при каждом нажатии клавиши в input?
  const activeItems = rawItems.filter((item) => item.category === "active");
  const handleSelect = (id: string) => setSelectedId(id);

  return (
    <div>
      <input value={note} onChange={(e) => setNote(e.target.value)} />
      <p>Выбрано: {selectedId}</p>
      <ExpensiveList items={activeItems} onSelect={handleSelect} />
    </div>
  );
}
```

```tsx
// Решение
// Причина: React.memo сравнивает пропсы поверхностно через Object.is.
// 1. rawItems.filter(...) на каждом рендере возвращает НОВЫЙ массив (новую ссылку).
// 2. handleSelect = (id) => ... на каждом рендере создаёт НОВУЮ функцию.
// Решение — стабилизировать обе ссылки через useMemo и useCallback
// (либо вынести поле ввода note в отдельный дочерний компонент State Colocation,
// чтобы Catalog вообще не ре-рендерился при наборе текста).

import React, { useCallback, useMemo, useState } from "react";

export function CatalogOptimized({ rawItems }: { rawItems: Item[] }) {
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeItems = useMemo(
    () => rawItems.filter((item) => item.category === "active"),
    [rawItems]
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      <input value={note} onChange={(e) => setNote(e.target.value)} />
      <p>Выбрано: {selectedId}</p>
      <ExpensiveList items={activeItems} onSelect={handleSelect} />
    </div>
  );
}
```

---

## 5. (React-паттерны) Реализовать `Tabs` через паттерн Compound Components

```tsx
/*
Спроектировать компонент вкладок <Tabs>, который используется декларативно:

<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">Профиль</Tabs.Trigger>
    <Tabs.Trigger value="billing">Оплата</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="profile">Настройки профиля</Tabs.Content>
  <Tabs.Content value="billing">История платежей</Tabs.Content>
</Tabs>

Требования:
- состояние активной вкладки хранится внутри Tabs и раздаётся через Context;
- если <Tabs.Trigger> или <Tabs.Content> отрендерили вне <Tabs>, выбрасывать понятную ошибку.
*/

import React, { createContext, useContext, useState, ReactNode } from "react";

// TODO
```

```tsx
// Решение
import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Компоненты Tabs.* должны использоваться внутри <Tabs>");
  }
  return ctx;
}

export function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isSelected = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Content = function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
};
```

---

## 6. (Паттерны GoF + TypeScript) Типобезопасный `EventBus` (Pub/Sub) с отпиской

```tsx
/*
Реализовать класс EventBus<Events>, где Events — словарь событий и их payload:
type AppEvents = {
  "auth:logout": { reason: string };
  "toast:show": { message: string; type: "info" | "error" };
};

Методы:
- on(event, handler): возвращает функцию unsubscribe () => void
- emit(event, payload): вызывает все текущие подписчики этого события
- off(event, handler): удаляет конкретный обработчик
*/

export class EventBus<Events extends Record<string, unknown>> {
  // TODO
}
```

```tsx
// Решение
type Handler<Payload> = (payload: Payload) => void;

export class EventBus<Events extends Record<string, unknown>> {
  private listeners: {
    [K in keyof Events]?: Set<Handler<Events[K]>>;
  } = {};

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    let set = this.listeners[event];
    if (!set) {
      set = new Set();
      this.listeners[event] = set;
    }
    set.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    // Копируем в массив на случай, если обработчик отпишет сам себя во время вызова
    const handlers = this.listeners[event];
    if (!handlers) return;
    [...handlers].forEach((handler) => handler(payload));
  }
}
```

---

## 7. (SOLID: SRP + DIP) Рефакторинг «Божественного компонента» (`OrderWidget`)

```tsx
/*
Компонент нарушает Single Responsibility (SRP) и Dependency Inversion (DIP):
он сам ходит в window.fetch, сам считает бизнес-скидку, сам форматирует валюту
и сам рендерит UI. Его невозможно протестировать без мока глобального fetch.

Разделите ответственность:
1) чистая доменная функция расчёта итоговой суммы calculateFinalPrice;
2) абстракция API / кастомный хук useOrder(orderId, orderApi);
3) чистый презентационный компонент OrderView.
*/

export function OrderWidgetBad({ orderId }: { orderId: string }) {
  const [order, setOrder] = React.useState<any>(null);

  React.useEffect(() => {
    fetch(`https://api.shop.local/v1/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then(setOrder);
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  let total = 0;
  for (const item of order.items) {
    total += item.price * item.qty;
  }
  if (order.isVip) total *= 0.85;

  return <div>К оплате: {total.toFixed(2)} ₽</div>;
}
```

```tsx
// Решение
import React, { useEffect, useState } from "react";

// 1. Доменная модель и чистая бизнес-логика (тестируется обычным unit-тестом за 1 мс)
export interface OrderItem {
  id: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  isVip: boolean;
}

export function calculateFinalPrice(order: Order): number {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return order.isVip ? subtotal * 0.85 : subtotal;
}

// 2. Контракт инфраструктурного слоя (Dependency Inversion)
export interface OrderRepository {
  getById(orderId: string, signal?: AbortSignal): Promise<Order>;
}

// 3. Хук оркестрации состояния загрузки
export function useOrder(orderId: string, repo: OrderRepository) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    repo
      .getById(orderId, controller.signal)
      .then((data) => {
        setOrder(data);
        setIsLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [orderId, repo]);

  return { order, isLoading };
}

// 4. Чистое отображение (Presentational Component)
export function OrderView({ order }: { order: Order }) {
  const finalPrice = calculateFinalPrice(order);
  return <div>К оплате: {finalPrice.toFixed(2)} ₽</div>;
}
```

---

## 8. (Архитектура: FSD) Найти и исправить 4 нарушения правил Feature-Sliced Design

```tsx
/*
В проекте на Feature-Sliced Design есть следующие импорты.
Найдите 4 архитектурных нарушения правил слоёв/слайсов и напишите,
как правильно перестроить зависимости.

Файл 1: src/entities/user/model/userStore.ts
import { loginModalOpen } from "@/features/auth-by-phone/model/modalSlice";

Файл 2: src/features/add-to-cart/ui/AddToCartButton.tsx
import { PromoBanner } from "@/widgets/promo-header/ui/PromoBanner";

Файл 3: src/features/transfer-money/model/submitTransfer.ts
import { validateCard } from "@/features/card-binding/lib/validateCard";

Файл 4: src/pages/profile/ui/ProfilePage.tsx
import { Avatar } from "@/entities/user/ui/Avatar/AvatarInternal";
*/
```

```tsx
// Решение
// Правило FSD:
// 1) Иерархия слоёв сверху вниз: app -> pages -> widgets -> features -> entities -> shared.
//    Импортировать можно ТОЛЬКО со слоёв, лежащих строго ниже.
// 2) Внутри одного слоя (например, features) слайсы НЕ могут импортировать друг друга напрямую (запрет кросс-импортов).
// 3) Снаружи слайса можно импортировать только через его Public API (index.ts), а не лезть во внутренние папки.

/*
Разбор нарушений и исправления:

1. Нарушение в src/entities/user/model/userStore.ts:
   Слой `entities` импортирует из вышележащего слоя `features` (features/auth-by-phone).
   Исправление: `entities/user` ничего не должен знать про фичу авторизации. Связка «при 401/логауте открыть модалку» поднимается на уровень `features/auth-by-phone`, `widgets` или `app` (либо через подписку на событие / слот).

2. Нарушение в src/features/add-to-cart/ui/AddToCartButton.tsx:
   Слой `features` импортирует из вышележащего слоя `widgets` (widgets/promo-header).
   Исправление: если компонент баннера переиспользуемый и не привязан к бизнес-сценарию виджета, опустить его в `shared/ui` или `entities/promo`, либо собирать композицию фичи и баннера наверху — внутри `widgets` или `pages`.

3. Нарушение в src/features/transfer-money/model/submitTransfer.ts:
   Горизонтальный кросс-импорт между двумя слайсами одного слоя `features` (`transfer-money` -> `card-binding`).
   Исправление: функцию `validateCard` нужно опустить ниже — в `entities/card` (если это доменное правило карты) или в `shared/lib/luhn` (если это чистая математическая валидация номера карты).

4. Нарушение в src/pages/profile/ui/ProfilePage.tsx:
   Глубокий импорт во внутренности чужого слайса (`@/entities/user/ui/Avatar/AvatarInternal`) в обход Public API.
   Исправление: экспортировать `Avatar` в `src/entities/user/index.ts` и импортировать как `import { Avatar } from "@/entities/user"`.
*/
```
