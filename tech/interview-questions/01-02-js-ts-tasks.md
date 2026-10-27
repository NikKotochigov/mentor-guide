# JavaScript + TypeScript: компактные задачи для подготовки

Условие и решение с разбором. Незаполненное место помечено `TODO`.

---

## 1. [JS] `this`: стрелочные функции, методы и деструктуризация

```js
const user = {
  name: "Alice",
  greetArrow: () => console.log("1:", this?.name),
  greetFn() {
    console.log("2:", this?.name);
  },
};

// Что выведет каждый вызов и почему?
user.greetArrow();
user.greetFn();

const { greetFn } = user;
greetFn();

class Timer {
  seconds = 10;
  tickArrow = () => console.log("4:", this.seconds);
  tickFn() {
    console.log("5:", this?.seconds);
  }
}

const timer = new Timer();
const { tickArrow, tickFn } = timer;
tickArrow();
tickFn();
```

```js
// Решение:
// 1: undefined — у arrow нет своего this, а объект user {} не создаёт лексической области.
// 2: Alice     — обычный метод, вызван через точку user.greetFn().
// 2: undefined — при деструктуризации потеряли контекст (вызов без точки, в strict mode this === undefined).
// 4: 10        — arrow-поле класса создаётся в конструкторе на экземпляре timer и навсегда замыкает this === timer.
// 5: undefined — метод с прототипа вызван без точки, this === undefined.
```

---

## 2. [JS] Event Loop: `async/await` + `Promise` + `setTimeout`

```js
// В каком порядке выведутся числа?
console.log(1);

setTimeout(() => console.log(2), 0);

async function run() {
  console.log(3);
  await Promise.resolve();
  console.log(4);
}

run();

Promise.resolve()
  .then(() => {
    console.log(5);
    throw new Error("boom");
  })
  .then(() => console.log(6))
  .catch(() => console.log(7));

console.log(8);
```

```js
// Решение: 1, 3, 8, 4, 5, 7, 2 (6 пропускается из-за throw)
// 1) Синхронный стек: 1 -> вход в run() до await: 3 -> 8
// 2) Микротаски: продолжение run() после await: 4 -> первый .then(): 5 -> throw перепрыгивает .then(6) -> .catch(): 7
// 3) Макротаска setTimeout: 2
```

---

## 3. [JS] Замыкания: `once(fn)` и `callLimit(fn, limit)`

```js
/*
Реализуй функцию once(fn), которая вызывает fn только при первом вызове,
а при всех последующих возвращает результат первого вызова.
Бонус: обобщи до callLimit(fn, limit).
*/

function once(fn) {
  // TODO
}
```

```js
// Решение
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function callLimit(fn, limit) {
  let count = 0;
  let lastResult;

  return function (...args) {
    if (count < limit) {
      count++;
      lastResult = fn.apply(this, args);
    }
    return lastResult;
  };
}
```

---

## 4. [JS] Асинхронность: `withTimeout` и `retry`

```js
/*
1. withTimeout(promise, ms) — отклоняет промис с Error("Timeout"), если он не завершился за ms мс.
2. retry(fn, retries) — повторяет асинхронную функцию fn до retries раз при ошибке.
*/

function withTimeout(promise, ms) {
  // TODO
}

async function retry(fn, retries = 3) {
  // TODO
}
```

```js
// Решение
function withTimeout(promise, ms) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error("Timeout")), ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timerId);
  });
}

async function retry(fn, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
```

---

## 5. [TS] Типизированный `pick` и `arrayFromKeys` без `any`

```ts
/*
Убрать any и строго типизировать обе функции:
- keys может содержать только существующие ключи obj
- возвращаемый тип выводится автоматически
*/

function pick(obj: any, keys: any[]) {
  // TODO
}

function arrayFromKeys(obj: any, keys: any[]) {
  // TODO
}
```

```ts
// Решение
function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

function arrayFromKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): T[K][] {
  return keys.map((key) => obj[key]);
}
```

---

## 6. [TS] Типизированный `groupBy`

```ts
/*
Реализуй и типизируй функцию groupBy(items, getKey),
группирующую элементы массива по строковому/числовому ключу.
*/

function groupBy(items, getKey) {
  // TODO
}
```

```ts
// Решение
function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  getKey: (item: T) => K,
): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    const key = getKey(item);
    (out[key] ??= []).push(item);
  }
  return out;
}
```

---

## 7. [TS] Discriminated Union + пользовательский Type Guard + `assertNever`

```ts
type PaymentState =
  | { status: "pending" }
  | { status: "paid"; receiptUrl: string }
  | { status: "failed"; reason: string };

// 1. Напиши type guard isPaid
function isPaid(state: PaymentState) {
  // TODO
}

// 2. Допиши getPaymentMessage с exhaustive check через never
function getPaymentMessage(state: PaymentState): string {
  // TODO
}
```

```ts
// Решение
function isPaid(
  state: PaymentState,
): state is Extract<PaymentState, { status: "paid" }> {
  return state.status === "paid";
}

function assertNever(value: never): never {
  throw new Error(`Unhandled state: ${JSON.stringify(value)}`);
}

function getPaymentMessage(state: PaymentState): string {
  switch (state.status) {
    case "pending":
      return "Ожидаем оплату";
    case "paid":
      return `Чек: ${state.receiptUrl}`;
    case "failed":
      return `Ошибка: ${state.reason}`;
    default:
      return assertNever(state);
  }
}
```

---

## 8. [TS] Свой `DeepReadonly<T>` и `MyReturnType<F>`

```ts
// 1. Реализуй MyReturnType без встроенного ReturnType
type MyReturnType<F> = // TODO

// 2. Реализуй DeepReadonly для вложенных объектов (не ломая функции)
type DeepReadonly<T> = // TODO
```

```ts
// Решение
type MyReturnType<F extends (...args: any[]) => any> = F extends (
  ...args: any[]
) => infer R
  ? R
  : never;

type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
```
