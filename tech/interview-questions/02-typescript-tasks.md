# TypeScript: задачи

Условие и решение — кодом. Незаполненное место помечено `TODO`.

---

## 1. `arrayFromKeys` — типизация без `any`

```ts
// Условие: убрать слабую типизацию.
// keys — только keyof obj; результат — значения по этим ключам.
// arrayFromKeys(obj, ["x"]) — ошибка компиляции.

const arrayFromKeys = (obj: Record<string, any>, keys: string[]) => {
  const out = [];
  for (const key of keys) {
    out.push(obj[key]);
  }
  return out;
};

const obj = { a: 1, b: "B", "c d": null };

const values = arrayFromKeys(obj, ["a", "b"]);
// ожидаемый тип values: (number | string)[]
```

```ts
// Решение

function arrayFromKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): T[K][] {
  const out: T[K][] = [];
  for (const key of keys) {
    out.push(obj[key]);
  }
  return out;
}

const obj = { a: 1, b: "B", "c d": null };
const values = arrayFromKeys(obj, ["a", "b"]);
// (number | string)[]
```

```ts
// Follow-up: кортеж по порядку ключей

function arrayFromKeysTuple<
  T extends object,
  const K extends readonly (keyof T)[],
>(obj: T, keys: K): { [I in keyof K]: T[Extract<K[I], keyof T>] } {
  return keys.map((key) => obj[key]) as {
    [I in keyof K]: T[Extract<K[I], keyof T>];
  };
}

const obj = { a: 1, b: "B", "c d": null };
const tuple = arrayFromKeysTuple(obj, ["a", "b"] as const);
// [number, string]
```
