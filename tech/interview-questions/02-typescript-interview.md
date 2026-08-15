# Мок-интервью: TypeScript (Frontend / React)

**Уровень:** Middle (универсальный)  
**Язык:** русский  
**Длительность блока:** 40–55 мин  
**Live-coding:** опционально (в конце или вместо части теории)  
**Контекст:** обычно идёт после JS; на РФ-собесах TS почти всегда спрашивают на Middle frontend.

---

## Как проводить

### Сценарий
1. Сказать, что блок про TypeScript (~40–55 мин), упор на практику в React/API, не на «теорию компиляторов».
2. Идти по блокам 1→6 — сложность растёт, темы связаны.
3. Уверенный ответ → **follow-up**. Буксует → **упрощение** или следующий блок.
4. Live-coding — если есть время или теория «на словах», а руками хочется проверить.
5. В конце 2–3 минуты фидбека.

### Тайминг (ориентир)

| Блок | Тема | Время |
|------|------|-------|
| 1 | База: зачем TS, any/unknown/never | 5–7 мин |
| 2 | Union, narrowing, literal types | 7–9 мин |
| 3 | `type` vs `interface`, union/mapped/conditional, extends | 7–9 мин |
| 4 | Generics | 8–10 мин |
| 5 | Utility types, keyof/typeof, mapped/conditional | 8–10 мин |
| 6 | React + TS, tsconfig/strict | 5–7 мин |
| ★ | Live-coding (опционально) | 15–20 мин |

### Как оценивать Middle

| Уровень ответа | Признаки |
|----------------|----------|
| **Сильный** | Объясняет зачем тип, приводит пример из React/API, сам говорит про narrowing/generics edge cases |
| **Средний (норма для Middle)** | Пишет/называет рабочие типы, путается в advanced (conditional/mapped), после подсказки выправляется |
| **Слабый** | Всё через `any`, не отличает interface/type, не умеет сузить union |

**Ожидание Middle:** уверенные блоки 1–4, utility types из блока 5, React-типизация из блока 6. Conditional/mapped — плюс, не блокер.

---

# Вопросы с ответами

---

## Блок 1. База TypeScript

*Разминка. Отделяем тех, кто «писал с any», от тех, кто понимает модель типов.*

### 1. Зачем нужен TypeScript? Чем он отличается от JavaScript?

**Зачем спрашивают:** старт почти любого TS-скрининга в РФ.

**Эталонный ответ (для ментора):**

TypeScript = JavaScript + **статическая система типов** + возможности, которые компилируются в обычный JS (иногда с downlevel).

Ключевые свойства:
- типы существуют **на этапе компиляции**, в runtime их почти нет (erase);
- ловит классы ошибок до запуска: опечатки в полях, неверные аргументы, null-доступы (при strict);
- улучшает DX: автодополнение, рефакторинг, документация контрактов API/компонентов;
- это **структурная** система типов (duck typing), не номинальная как в Java/C#.

Что ловит на практике:

```ts
type User = { id: string; name: string };

function greet(user: User) {
  console.log(user.nmae); // ошибка компиляции: Property 'nmae' does not exist
}

greet({ id: "1" }); // ошибка: нет name

const el = document.getElementById("root");
// el.textContent = "..."; // при strictNullChecks — ошибка: el может быть null
if (el) {
  el.textContent = "..."; // ок
}
```

Erase типов — в бандле не останется `User` / аннотаций:

```ts
// TS
const age: number = 30;

// JS на выходе
const age = 30;
```

Ограничения:
- не заменяет тесты и runtime-валидацию (данные с сервера всё равно `unknown` + parse);
- можно «обмануть» через `any` / `as` / `@ts-ignore`;
- цена — компиляция, конфиг, иногда борьба с типами библиотек.

**Хороший ответ кандидата:** «статическая проверка + DX, типы стираются, JS на выходе; не спасает от кривых данных API без валидации».

**Красные флаги:**
- «TS выполняется в браузере».
- «TS делает код быстрее в runtime».
- Не понимает erase типов.

**Follow-up:** Что останется в JS после компиляции от `interface` / `type`?  
→ Ничего. А `enum` (не const) и `namespace` могут оставить runtime-код.

**Упрощение:** «Можно ли в runtime проверить, что переменная имеет тип `User`?»

---

### 2. В чём разница между `any`, `unknown` и `never`?

**Зачем спрашивают:** топ-вопрос; сразу видно культуру типизации.

**Эталонный ответ:**

| Тип | Смысл | Можно присвоить / читать |
|-----|--------|---------------------------|
| `any` | отключить проверку | всё что угодно; с ним можно делать всё — «дыра» в системе типов |
| `unknown` | «значение есть, тип не знаем» | принять можно почти что угодно; **использовать** — только после narrowing |
| `never` | значение, которого не бывает | нет значений этого типа; полезен для исчерпывающих проверок и невозможных веток |

```ts
// any — «заражает» и отключает проверки
function bad(x: any) {
  x.foo.bar.baz(); // компилятор молчит — упадёт в runtime
}

// unknown — безопасный default для внешних данных
function handle(x: unknown) {
  // x.toFixed(); // ошибка
  if (typeof x === "number") {
    x.toFixed(2); // ок, сузили
  }
}

const fromApi: unknown = JSON.parse('{"id":"1"}');
// fromApi.id; // ошибка — сначала guard / schema

// never — невозможное значение / исчерпывающий switch
function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}

type Shape = "circle" | "square";
function area(s: Shape) {
  switch (s) {
    case "circle": return Math.PI;
    case "square": return 1;
    default: return assertNever(s); // новый вариант Shape сломает сборку
  }
}

function fail(message: string): never {
  throw new Error(message); // функция не возвращает значение
}
```

Ещё: `never` — bottom type (подтип всего). Пустой union / невозможное пересечение часто схлопывается в `never` (`string & number`).

Сравнение в одну строку:
- `any` = «доверяй мне во всём»;
- `unknown` = «сначала проверь»;
- `never` = «сюда никогда не должны попасть».

Правило Middle: внешние данные и «не знаю тип» → `unknown`, не `any`. `any` — осознанный escape hatch (legacy, очень узкие места).

**Красные флаги:**
- Путает `any` и `unknown`.
- Не знает `never` совсем (для Middle желательно хотя бы «невозможный тип / пустая ветка»).

**Follow-up:** Чем `any` отличается от omit типов / отсутствия аннотации при `noImplicitAny`?  
→ Без аннотации при `noImplicitAny` будет ошибка; `any` — явное отключение проверки.

---

## Блок 2. Union, narrowing, литералы

*От «дыр» any/unknown — к повседневной работе с вариантами данных (API, props, state).*

### 3. Что такое union и intersection? Когда что использовать?

**Эталонный ответ:**

- **Union** `A | B` — значение одного из вариантов («или»).  
  Пример: `string | number`, `"loading" | "success" | "error"`, `User | null`.
- **Intersection** `A & B` — значение должно удовлетворять обоим («и»).  
  Пример: `Props & { className?: string }`, смешение миксинов типов.

```ts
// Union примитивов и опциональность через null
type Id = string | number;
type MaybeUser = User | null;

function printId(id: Id) {
  console.log(String(id));
}

// Discriminated union — лучшая практика для вариантов объектов
type Success = { status: "ok"; data: string };
type Fail = { status: "error"; message: string };
type Result = Success | Fail;

function getMessage(result: Result): string {
  if (result.status === "ok") return result.data;
  return result.message;
}

// Intersection — склеить контракты
type Timestamped = { createdAt: Date; updatedAt: Date };
type User = { id: string; name: string };
type StoredUser = User & Timestamped;

const stored: StoredUser = {
  id: "1",
  name: "Ada",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// React: расширить props
type ButtonProps = {
  title: string;
  onClick: () => void;
};
type WithClassName = { className?: string };
type FancyButtonProps = ButtonProps & WithClassName;
```

Когда что выбирать:
- несколько **альтернатив** формы/значения → union;
- объект должен иметь **все** поля из нескольких типов → intersection;
- «пользователь или админ как роли» чаще `type Role = "user" | "admin"`, а не плохой `User | Admin` без дискриминатора.

Ловушки:
- `string & number` → `never`;
- для объектов intersection «склеивает» поля; конфликт одноимённых полей с несовместимыми типами → часто `never` у поля;
- слишком широкий union без narrowing заставляет везде писать проверки.

**Красные флаги:** путает `|` и `&`; пишет `User | Admin` там, где нужны общие поля через `&` или наоборот.

**Follow-up:** Что такое discriminated union (tagged union)? Почему `status`/`type` поле удобно?  
→ Общий литеральный тег позволяет сузить весь объект одной проверкой.

---

### 4. Что такое type narrowing? Какие есть способы сузить тип?

**Зачем спрашивают:** критично для Middle; без этого union/`unknown` бесполезны. На РФ-собесах часто просят перечислить способы и показать на примере.

**Эталонный ответ (для ментора):**

**Type narrowing** (сужение типа) — это когда TypeScript **внутри ветки кода** понимает более узкий тип, чем был объявлен снаружи. Работает через **control flow analysis**: компилятор смотрит на `if` / `switch` / `return` / `throw` и вычитает невозможные варианты из union.

Зачем нужно:
- union (`string | number`, `User | null`, `Success | Fail`) снаружи широкий;
- внутри проверки можно безопасно вызывать методы/читать поля только одного варианта;
- альтернатива — плохой `as`, который врёт компилятору и не даёт runtime-защиты.

Важно: narrowing — это **только этап компиляции**. В runtime остаются обычные JS-проверки (`typeof`, `===` и т.д.). TS лишь «подстраивает» типы под эти проверки.

---

#### 1) `typeof` — для примитивов

```ts
function printId(id: string | number) {
  if (typeof id === "string") {
    // здесь id: string
    console.log(id.toUpperCase());
  } else {
    // здесь id: number
    console.log(id.toFixed(0));
  }
}
```

Ограничения:
- `typeof null === "object"` — как в JS; для `object | null` одного `typeof` мало;
- `typeof` не отличает массивы/обычные объекты (`оба "object"`);
- для class-инстансов обычно берут `instanceof`, не `typeof`.

---

#### 2) Truthiness / проверка на `null` и `undefined`

```ts
function greet(name?: string | null) {
  if (name) {
    // name: string (убрали null | undefined | "")
    console.log(name.toUpperCase());
  }
}

function load(user: User | null) {
  if (user == null) return; // ловит и null, и undefined
  // user: User
  console.log(user.id);
}
```

Нюанс: `if (name)` отсекает ещё и `""` / `0` / `false`. Если пустая строка валидна — лучше явная проверка `name != null` или `typeof name === "string"`.

---

#### 3) Равенство (`===`, `!==`, `switch`)

```ts
function handle(status: "idle" | "loading" | "error") {
  if (status === "loading") {
    // status: "loading"
  }
  switch (status) {
    case "idle":
      return;
    case "loading":
      return;
    case "error":
      return;
  }
}
```

Часто используют вместе с **discriminated union** (см. п. 5).

---

#### 4) Оператор `in` — наличие поля

```ts
type Cat = { meow: () => void };
type Dog = { bark: () => void };

function speak(animal: Cat | Dog) {
  if ("meow" in animal) {
    animal.meow(); // Cat
  } else {
    animal.bark(); // Dog
  }
}
```

Удобно, когда у вариантов разные поля и нет общего тега `type`/`kind`. Минус: проверка только на ключ, не на «форму» глубоко; легко ошибиться, если ключи пересекаются.

---

#### 5) Discriminated union (tagged union) — главный паттерн в React/API

Общее литеральное поле-дискриминатор (`type`, `kind`, `status`):

```ts
type Success = { status: "ok"; data: string };
type Fail = { status: "error"; message: string };
type Result = Success | Fail;

function getData(result: Result): string {
  if (result.status === "ok") {
    return result.data; // Success
  }
  return result.message; // Fail
}
```

Почему это любят на собесах: после проверки одного поля TS сужает **весь объект**, а не только поле. Это база для state-машин UI, ответов API, Redux-like экшенов.

---

#### 6) `instanceof` — для классов / встроенных объектов

```ts
function getDateLabel(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value.toUpperCase();
}

if (err instanceof Error) {
  console.log(err.message);
}
```

Ограничения: плохо работает через iframe/разные realm; для plain-object DTO с бэка классов обычно нет — там guards/схемы.

---

#### 7) `Array.isArray`

```ts
function normalize(input: string | string[]) {
  if (Array.isArray(input)) {
    return input.join(","); // string[]
  }
  return input; // string
}
```

`typeof input === "object"` тут не поможет отличить массив.

---

#### 8) Type predicate (`x is T`) — свой type guard

Обычная функция, возвращающая `boolean`, **не сужает** тип снаружи. Нужна аннотация `param is Type`:

```ts
type User = { id: string; name: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as User).id === "string" &&
    typeof (value as User).name === "string"
  );
}

function handle(data: unknown) {
  if (isUser(data)) {
    // data: User
    console.log(data.name);
  }
}
```

Без `value is User` внутри `if (isUser(data))` тип останется `unknown`.

В массивах: `arr.filter(isUser)` тоже сужает результат до `User[]` (для type predicate).

---

#### 9) Assertion functions (`asserts x is T`)

```ts
function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error("Not a user");
  }
}

function run(data: unknown) {
  assertUser(data);
  // после вызова data: User
  console.log(data.id);
}
```

Отличие от predicate: не возвращает `boolean`, а **гарантирует** тип после вызова или бросает ошибку. Удобно на границах модулей / в начале функции.

---

#### 10) Присваивание и контроль потока (менее очевидно, но полезно знать)

```ts
function example(x: string | number | boolean) {
  if (typeof x === "string" || typeof x === "number") {
    // x: string | number
  } else {
    // x: boolean
  }
}

let value: string | number;
value = Math.random() > 0.5 ? "hi" : 1;
// дальше TS может сузить по факту присваивания в простых случаях
```

Также `return` / `throw` в ранней ветке сужают тип «ниже по функции» (early return — частый стиль в React-хендлерах).

---

#### Чем narrowing НЕ является

| Подход | Проблема |
|--------|----------|
| `as User` / `<User>data` | Нет проверки; можно солгать типам |
| `@ts-ignore` / `any` | Отключает систему типов |
| «Просто поверили бэку» | Runtime может прислать другое |

Правильная граница системы: `unknown` → narrowing / zod (`parse`) → узкий тип.

---

**Хороший ответ кандидата (1–2 мин):**
«Это control flow analysis: после проверки union становится уже. Основные способы — typeof, проверка на null, ===/switch, in, instanceof, Array.isArray, discriminated union, type guard с `is`, иногда asserts. Покажу пример с `status: "ok" | "error"`.»

**Красные флаги:**
- Сразу предлагает `as` вместо проверки.
- Пишет helper `function isUser(x): boolean` и не понимает, почему тип не сузился.
- Путает narrowing с приведением типов / с runtime-валидацией библиотекой (близко по цели, но механизм другой).
- Думает, что narrowing «удаляет» варианты в runtime.

**Follow-up:** Чем `as User` отличается от type guard? Когда assertion допустим?  
→ Guard проверяет и сужает; `as` только говорит компилятору. `as` допустим, когда тип уже доказан иначе (DOM `getElementById` после проверки, узкие внутренние хелперы), но не для сырого `response.json()`.

**Follow-up 2:** Почему `filter` с обычным `Boolean` плохо сужает `(T | null)[]`?  
→ Нужен predicate: `arr.filter((x): x is T => x != null)`.

**Упрощение:** «Есть `string | number`. Как внутри функции безопасно вызвать `toUpperCase` только для строки?»

---

### 5. Что такое literal types? Зачем `as const`?

**Эталонный ответ:**

Литеральный тип — тип конкретного значения: `"admin"`, `42`, `true` — не широкий `string` / `number` / `boolean`.

```ts
type Role = "user" | "admin";
const role: Role = "admin";
// const bad: Role = "moderator"; // ошибка

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function send(method: HttpMethod, url: string) {
  /* ... */
}
send("GET", "/users");
```

Без `as const` / явной аннотации вывод часто **расширяется** (widening):

```ts
const status = "loading"; // тип string, не "loading"
const status2 = "loading" as const; // тип "loading"

const cfg = { method: "GET" }; // method: string
const cfg2 = { method: "GET" } as const; // method: "GET"

// частый кейс с fetch / библиотеками
fetch("/api", { method: "GET" }); // обычно ок
const options = { method: "GET" };
// fetch("/api", options); // иногда ошибка: string не assignable к RequestInit["method"]
const options2 = { method: "GET" } as const;
fetch("/api", options2); // ок
```

`as const` на массиве → readonly tuple:

```ts
const pair = [1, "a"] as const;
// тип: readonly [1, "a"]
type First = (typeof pair)[0]; // 1
```

Зачем: строгие состояния UI (`"idle" | "loading" | "error"`), API methods, кортежи, immutable конфиги, routes / query keys.

Связь с enum: многие команды предпочитают union литералов вместо enum (см. вопрос про enum).

**Follow-up:** Что сделает `as const` с массивом?  
→ readonly tuple литералов.

**Упрощение:** «Почему `const x = "ok"` имеет тип `string`, а не `"ok"`?»

---

## Блок 3. `type` vs `interface`, union / mapped / conditional

*Кандидат уже умеет собирать union — теперь как описывать объекты, где бессилен `interface`, и как расти контракты.*

### 6. Чем `type` отличается от `interface`? Что выбрать?

**Зачем спрашивают:** классика каждого второго собеса.

**Эталонный ответ:**

Общее: оба описывают форму объекта; в большинстве React-кейсов взаимозаменяемы.

| | `interface` | `type` |
|---|-------------|--------|
| Объекты | да | да |
| Union / mapped / conditional | нет (напрямую) | да |
| Extends / пересечение | `extends` | `&` |
| Declaration merging | **да** (слияние одноимённых) | нет |
| `implements` в class | удобно | тоже можно |
| Вычисляемые ключи / сложные выражения | слабее | сильнее |

```ts
interface User {
  id: string;
}
interface User { // merging
  name: string;
}
// User = { id: string; name: string }
```

Главное отличие на собесе — **что умеет `type`, а `interface` напрямую нет**:

#### Union (`A | B`)

```ts
type Success = { status: "ok"; data: string };
type Fail = { status: "error"; message: string };
type Result = Success | Fail; // только type alias

// interface Result = Success | Fail; // так нельзя

// React props с вариантами
type InputValue = string | number;
type Status = "idle" | "loading" | "success" | "error";
```

`interface` описывает одну форму объекта. Варианты («или») — территория `type`. На практике: статусы UI, ответы API, props вроде `string | string[]`.

Можно «обернуть» union в interface только косвенно (поле внутри), но сам alias на union — через `type`:

```ts
interface ApiEnvelope {
  result: Success | Fail; // union внутри поля — ок
}
```

#### Mapped types (`{ [K in ...] }`)

```ts
type User = { id: string; name: string; email: string };

type ReadonlyUser = { readonly [K in keyof User]: User[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };
type FeatureFlags = { [K in "darkMode" | "beta" | "analytics"]: boolean };

// как устроен Partial «своими руками»
type MyPartial<T> = { [K in keyof T]?: T[K] };
type UserDraft = MyPartial<User>; // все поля опциональны — удобно для форм
```

Mapped — «пройтись по ключам и собрать новый тип». Так устроены `Partial` / `Readonly` / `Pick` внутри. У `interface` нет синтаксиса `[K in ...]`.

#### Conditional types (`T extends U ? X : Y`)

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hi">; // true
type B = IsString<number>; // false

type ElementOf<T> = T extends (infer U)[] ? U : T;
type Item = ElementOf<string[]>; // string

type NonNullable<T> = T extends null | undefined ? never : T;
type C = NonNullable<string | null>; // string

// практичный хелпер
type ApiPayload<T> = T extends { data: infer D } ? D : never;
```

Условие на уровне типов + часто `infer`. Нужны для utility (`ReturnType`, `Exclude`) и типобезопасных хелперов. `interface` conditional выразить не может.

Краткий вывод для ментора: если кандидат говорит только «оба для объектов» — слабо. Сильный Middle сам приводит **union / mapped / conditional** как причину взять `type`.

Практика команд (часто на собесе ждут осознанный ответ):
- `interface` — для публичных объектных контрактов / props, которые могут расширять и мержить;
- `type` — для union, mapped, conditional, utility, вычисляемых типов;
- главное — **консистентность** в проекте.

**Красные флаги:** «interface устарел» / «type нельзя для объектов» — мифы; не может привести пример, где нужен именно `type`.

**Follow-up:** Что такое declaration merging и где оно реально нужно (augment библиотек, `Window`)?

**Follow-up 2:** Покажи мини-пример mapped или conditional (мост к блоку 5).  
→ Достаточно `Partial`-подобного `{ [K in keyof T]?: T[K] }` или `T extends string ? A : B`.

---

### 7. Как работает `extends` у интерфейсов и constraints у generics? Это одно и то же?

**Эталонный ответ:**

Слово одно — смыслы разные. На собесе важно явно разделить.

#### 1) Наследование интерфейсов / классов

```ts
interface BaseProps {
  className?: string;
  testId?: string;
}

interface ButtonProps extends BaseProps {
  onClick: () => void;
  title: string;
}

// ButtonProps = className? + testId? + onClick + title
const props: ButtonProps = {
  title: "Save",
  onClick: () => {},
  className: "btn",
};
```

Несколько родителей: `interface A extends B, C { ... }`.  
Аналог у `type`: `type ButtonProps = BaseProps & { onClick: () => void; title: string }`.

#### 2) Constraint дженерика — «T должен быть подтипом X»

```ts
function getId<T extends { id: string }>(item: T): string {
  return item.id;
}

getId({ id: "1", name: "Ada" }); // ок
// getId({ name: "Ada" }); // ошибка — нет id

function pickName<T extends { name: string }>(items: T[]): string[] {
  return items.map((i) => i.name);
}
```

Constraint говорит компилятору: внутри функции можно безопасно читать поля из ограничения.

#### 3) Conditional types

```ts
type IsArray<T> = T extends unknown[] ? true : false;
```

Здесь `extends` снова про совместимость типов, но уже в условном типе.

Не путать с runtime `extends` в JS-классах (`class Admin extends User`) — в типах это про assignability, не про прототипы.

**Красные флаги:** смешивает «наследование props» и «ограничение T» в один ответ без примеров.

**Упрощение:** «Как ограничить дженерик так, чтобы у аргумента точно было поле `id`?»

**Follow-up:** Чем `T extends object` отличается от `T extends Record<string, unknown>`? (на уровне идеи)

---

## Блок 4. Generics

*Сердце Middle TS. Связка: вместо any — параметр типа; связан с unknown и constraints.*

### 8. Что такое generics? Зачем они нужны? Пример

**Зачем спрашивают:** must-have для Middle.

**Эталонный ответ:**

Generics — параметризация типа: одна реализация, много конкретных типов с сохранением связей вход → выход.

```ts
function identity<T>(value: T): T {
  return value;
}

const a = identity(1);       // T = number
const b = identity("hello"); // T = string
const c = identity<User>(user); // T задали явно

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([10, 20]); // number | undefined
const s = first(["a", "b"]); // string | undefined
```

Без generics пришлось бы писать перегрузки или скатываться в `any`:

```ts
// плохо
function firstAny(arr: any[]): any {
  return arr[0];
}
```

Зачем в реальном frontend:
- `Promise<T>`, `AxiosResponse<T>`, `ApiResponse<T>`;
- хуки: `useState<T>`, свой `useLocalStorage<T>`;
- списки / таблицы / Select с разными item-типами;
- утилиты `pick` / `pluck` / `merge`.

Несколько параметров и default:

```ts
type ApiResponse<TData, TError = string> = {
  data: TData;
  error: TError | null;
};

type UserResponse = ApiResponse<User>;
type UserResponseWithCode = ApiResponse<User, { code: number; message: string }>;
```

Связь параметров:

```ts
function pair<T, U>(left: T, right: U): [T, U] {
  return [left, right];
}

const p = pair("id", 1); // [string, number]
```

**Красные флаги:**
- Пишет `identity(value: any): any`.
- Не может объяснить, чем generic лучше «просто unknown».
- Ставит `<T>` «для красоты», но не использует T в сигнатуре.

**Follow-up:** Что такое default type parameter? Когда нужен?  
→ Как `TError = string` выше — частый кейс не дублировать аргумент.

---

### 9. Приведи пример generic в React (компонент, хук или список)

**Эталонный ответ (ожидаемый на frontend-собесе):**

```ts
type ListProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
};

function List<T>({ items, keyExtractor, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// использование — T выводится из items
<List
  items={users}
  keyExtractor={(u) => u.id}
  renderItem={(u) => u.name} // u: User
/>;
```

Хук с generic:

```ts
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial; // assertion — зона риска, лучше schema
  });

  // ...
  return [value, setValue] as const;
}

const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
```

Другие частые кейсы:

```ts
const inputRef = useRef<HTMLInputElement>(null);
const [user, setUser] = useState<User | null>(null);

// пропсы нативной кнопки + свои
type IconButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  icon: React.ReactNode;
};
```

**Follow-up:** Как типизировать `useState` при `null` старте?  
→ `useState<User | null>(null)`.

**Follow-up 2:** Почему `React.FC` плохо стыкуется с generic-компонентами?  
→ Сложнее указать `<T>`, исторически неявные children; чаще пишут обычную function.

**Упрощение:** «Как правильно типизировать `useRef` для input?»  
→ `useRef<HTMLInputElement>(null)`.

---

### 10. Что такое keyof, typeof и indexed access types?

**Эталонный ответ:**

Три инструмента type-level «рефлексии» — очень частый Middle-вопрос.

```ts
type User = { id: string; name: string; age: number };

// keyof — union ключей
type UserKeys = keyof User; // "id" | "name" | "age"

// indexed access — тип поля
type Name = User["name"]; // string
type IdOrName = User["id" | "name"]; // string
type UserValues = User[keyof User]; // string | number

// typeof в позиции типа — взять тип значения
const user = { id: "1", name: "Ada" };
type UserFromValue = typeof user; // { id: string; name: string }

const Roles = { Admin: "admin", User: "user" } as const;
type Role = (typeof Roles)[keyof typeof Roles]; // "admin" | "user"
```

`typeof` в типах ≠ JS `typeof` в runtime: контекст смотрит компилятор.

Типобезопасный доступ к полю:

```ts
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const name = pluck({ id: "1", name: "Ada" }, "name"); // string
// pluck(user, "email"); // ошибка, если email нет в типе
```

Зачем: формы, словари переводов, select по полям объекта, `Object.keys` + типобезопасный map.

**Красные флаги:** путает runtime `typeof` и type-level `typeof`; пишет `obj[key]` и получает `any` без `K extends keyof T`.

**Follow-up:** Чем `keyof T` отличается от `Object.keys` в runtime?  
→ `Object.keys` возвращает `string[]` (исторически / из‑за прототипов) — часто нужен хелпер или аккуратный cast.

---

## Блок 5. Utility types и «магия» типов

*Популярные добивки на Middle. Не обязательно идеально знать mapped/conditional — но Partial/Pick/Omit ждут почти всегда.*

### 11. Какие utility types знаешь? Объясни Partial, Required, Pick, Omit, Record, Readonly

**Зачем спрашивают:** самый частый «практический» блок после generics.

**Эталонный ответ:**

| Utility | Смысл | Типичный кейс |
|---------|--------|----------------|
| `Partial<T>` | все поля опциональны | PATCH / черновик формы |
| `Required<T>` | все поля обязательны | после заполнения формы |
| `Readonly<T>` | все поля readonly | конфиг, props «не мутировать» |
| `Pick<T, K>` | взять набор ключей | карточка превью |
| `Omit<T, K>` | исключить ключи | CreateDto без `id` |
| `Record<K, V>` | объект с ключами K и значениями V | словарь ролей / карты |
| `Exclude<T, U>` | из union T убрать extends U | убрать `"error"` из статусов |
| `Extract<T, U>` | из union оставить extends U | только строковые ключи |
| `NonNullable<T>` | убрать null \| undefined | после проверки |
| `ReturnType<F>` | тип возврата функции | тип результата хука/селектора |
| `Parameters<F>` | кортеж аргументов | обертки над функциями |
| `Awaited<T>` | развернуть Promise | тип результата async |

Примеры из жизни:

```ts
type User = { id: string; name: string; email: string };

type UserDraft = Partial<User>;
// { id?: string; name?: string; email?: string }

type CreateUserDto = Omit<User, "id">;
// { name: string; email: string }

type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }

type Roles = Record<"admin" | "user", { permissions: string[] }>;
const roles: Roles = {
  admin: { permissions: ["read", "write"] },
  user: { permissions: ["read"] },
};

type Status = "idle" | "loading" | "error";
type NonError = Exclude<Status, "error">; // "idle" | "loading"

function getUser() {
  return { id: "1", name: "Ada" };
}
type GetUserResult = ReturnType<typeof getUser>; // { id: string; name: string }
```

Для Middle достаточно уверенно объяснить 5–6 штук и зачем в API/формах/DTO. Сильный кандидат пару штук «раскроет» через mapped.

**Красные флаги:** путает `Pick` и `Omit`; не может привести кейс; говорит «это магия компилятора» без примера.

**Follow-up:** Как сделать все поля nullable?  
→ mapped: `{ [K in keyof T]: T[K] | null }`.

---

### 12. Что такое mapped types? Приведи простой пример

**Эталонный ответ:**

Mapped type — создание нового типа **проходом по ключам** другого типа (как `Array.map`, но для типов).

```ts
type User = { id: string; name: string; age: number };

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type UserForm = MyPartial<User>;
type UserRow = Nullable<User>;
```

Модификаторы:
- добавить: `readonly`, `?`;
- снять: `-readonly`, `-?`.

```ts
type Concrete<T> = {
  [K in keyof T]-?: T[K]; // все поля обязательны
};
```

Ключи не только из `keyof T` — можно из union литералов:

```ts
type Flags = { [K in "darkMode" | "beta"]: boolean };
// { darkMode: boolean; beta: boolean }
```

Template literal + key remapping (advanced, плюс для Middle+):

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
```

Не обязательно требовать remapping на Middle — достаточно идеи «пройтись по keyof и преобразовать» + связать с `Partial`/`Readonly`.

**Упрощение:** «Как примерно устроен `Partial<T>` внутри?»  
→ `{ [K in keyof T]?: T[K] }`.

**Follow-up:** Чем mapped type отличается от `Record<K, V>`?  
→ `Record` задаёт одинаковый V для ключей; mapped может зависеть от каждого `T[K]`.

---

### 13. Что такое conditional types? Пример `T extends U ? X : Y`

**Эталонный ответ:**

Conditional type — выбор типа по условию совместимости (assignability), аналог тернарника, но **только на этапе компиляции**.

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<number>; // false

type ApiResult<T> = T extends { error: infer E }
  ? { ok: false; error: E }
  : { ok: true; data: T };
```

`infer` — «вытащи тип изнутри» в ветке условия:

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;
type E1 = ElementType<string[]>; // string
type E2 = ElementType<number>; // number

type AwaitedSimple<T> = T extends Promise<infer U> ? U : T;
type V = AwaitedSimple<Promise<User>>; // User

// ReturnType «своими руками»
type MyReturnType<F> = F extends (...args: any) => infer R ? R : never;
type R = MyReturnType<() => number>; // number
```

Distributive behavior: conditional по «голому» type parameter распределяется по union:

```ts
type NoNull<T> = T extends null | undefined ? never : T;
type T1 = NoNull<string | null>; // string
// как будто: NoNull<string> | NoNull<null> → string | never → string
```

Практические места: `Exclude` / `Extract` / `NonNullable` / `ReturnType` / `Awaited` внутри стандартной библиотеки.

На Middle: понять идею + `infer` на простом примере. Глубокий gymnastics — Senior.

**Красные флаги:** путает с runtime `?:` ternary; думает, что conditional выполняется в браузере.

**Follow-up:** Для чего `infer`? Покажи `ReturnType` «своими руками».  
→ См. `MyReturnType` выше.

---

### 14. Enum в TypeScript: плюсы/минусы. Чем заменить?

**Эталонный ответ:**

`enum` — одна из немногих TS-фич с **runtime** представлением (обычный enum → объект в JS).

```ts
enum Direction {
  Up,    // 0
  Down,  // 1
}
// runtime примерно:
// Direction = { Up: 0, Down: 1, 0: "Up", 1: "Down" }  // reverse mapping у numeric

enum Status {
  Idle = "idle",
  Loading = "loading",
}
```

Плюсы (что могут сказать):
- удобный неймспейс значений;
- автодополнение;
- string enum читаемее numeric.

Минусы, которые часто ждут услышать:
- лишний runtime-код и бандл;
- numeric enum плохо treeshake-ится / странный reverse mapping;
- числовые enum сравнимы с любыми number — источник багов;
- хуже стыкуется с union-first стилем и `as const` объектами.

Альтернативы (предпочтительны во многих React-командах):

```ts
const Direction = {
  Up: "UP",
  Down: "DOWN",
} as const;

type Direction = (typeof Direction)[keyof typeof Direction]; // "UP" | "DOWN"

// ещё проще
type Status = "idle" | "loading" | "error";
```

`const enum` инлайнится в литералы, но с оговорками (часто запрещён правилами проекта / `isolatedModules` / bundlers).

**Красные флаги:** «enum и union — одно и то же»; не знает про runtime-код.

**Follow-up:** Чем string enum лучше numeric?  
→ Нет reverse mapping, значения читаемы в сети/логах, меньше сюрпризов со сравнением.

---

## Блок 6. Практика: React, strict, границы системы

*Добиваем тем, что реально спрашивают на frontend Middle.*

### 15. Что включает `strict` в tsconfig? Какие флаги важны?

**Эталонный ответ:**

`"strict": true` включает набор флагов (смысл — максимальная безопасность по умолчанию):
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`
- (точный список смотри в доке версии TS — набор расширяется со временем)

Самое заметное в повседневке frontend:

```ts
// strictNullChecks
function fullName(user: { name?: string }) {
  // user.name.toUpperCase(); // ошибка: possibly undefined
  return user.name?.toUpperCase();
}

// noImplicitAny
function log(x) { // ошибка: Parameter 'x' implicitly has an 'any' type
  console.log(x);
}
function logOk(x: string) {
  console.log(x);
}
```

Ещё полезные флаги **вне** базового `strict`:
- `noUncheckedIndexedAccess` — `arr[0]` → `T | undefined`;
- `exactOptionalPropertyTypes` — строже опциональные поля;
- `skipLibCheck` — не проверять `.d.ts` зависимостей (скорость);
- `jsx`, `moduleResolution: "bundler"` — под современный React/Vite.

**Красные флаги:** «strict просто ругается сильнее» без примеров; предлагает выключить `strictNullChecks` «чтобы было проще».

**Follow-up:** Почему без `strictNullChecks` TypeScript заметно слабее для frontend?  
→ `null`/`undefined` снова «везде», типичные runtime-краши (`Cannot read property of null`) компилятор не ловит.

---

### 16. Как типизировать props, события и детей в React?

**Эталонный ответ:**

```ts
type ButtonProps = {
  title: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
};

function Button({ title, disabled, onClick, children }: ButtonProps) {
  return (
    <button disabled={disabled} onClick={onClick}>
      {title}
      {children}
    </button>
  );
}
```

События форм:

```ts
function onChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value);
}

function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}
```

Проброс нативных атрибутов + свои props:

```ts
type IconButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  icon: React.ReactNode;
  loading?: boolean;
};

function IconButton({ icon, loading, children, ...rest }: IconButtonProps) {
  return (
    <button aria-busy={loading} {...rest}>
      {icon}
      {children}
    </button>
  );
}
```

Полезные типы:
- `React.ReactNode` — что можно отрендерить (`string`, `null`, элементы, массивы…);
- `React.ReactElement` — уже именно элемент, уже;
- `React.FC` / `FunctionComponent` — сейчас часто **не рекомендуют** как default (исторически неявные children, хуже с generics); лучше явные props;
- `CSSProperties`, `HTMLAttributes<T>`, `ComponentProps<"div">`.

**Красные флаги:** `onClick: any`; children через `React.FC` «потому что так в старых гайдах»; не знает `ChangeEvent`.

**Follow-up:** Как пробросить все атрибуты нативной кнопки + свои props?  
→ `ComponentPropsWithoutRef<"button"> & { loading?: boolean }`.

---

### 17. Как типизировать данные с бэка? Почему недостаточно `as User`?

**Эталонный ответ:**

TS не проверяет сеть и JSON. `fetch().json()` по типам — неизвестные данные; assertion лишь затыкает компилятор.

Плохо:

```ts
type User = { id: string; name: string };

const res = await fetch("/api/user");
const user = (await res.json()) as User; // ложь компилятору
console.log(user.name.toUpperCase()); // может упасть, если поля нет
```

Лучше — граница системы:

```ts
const res = await fetch("/api/user");
const data: unknown = await res.json();

// 1) ручной type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof (value as User).id === "string" &&
    typeof (value as User).name === "string"
  );
}

if (!isUser(data)) throw new Error("Invalid user");
// data: User

// 2) schema library (предпочтительно в Mid+)
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type UserFromSchema = z.infer<typeof UserSchema>;
const user = UserSchema.parse(data); // UserFromSchema или throw
```

Связь с блоками 1–2: `unknown` → narrowing / validation → узкий тип.  
`as User` допустим только когда данные уже проверены иначе или это узкий внутренний хелпер с доверительным контрактом.

**Красные флаги:** «просто пишу `as User` везде»; не понимает разницы compile-time и runtime.

**Follow-up:** Что такое type-safe schema library и зачем `z.infer<typeof schema>`?  
→ Один source of truth: runtime-проверка + статический тип без дублирования руками.

---

# Live-coding (опционально)

*Включай при 15+ минутах или если теория «средняя».*

**Как вести:** условие → уточнения → код → края → follow-up.

---

## Задача A (базовая): сужение union / type guard

**Условие:** Есть типы сообщений. Напиши функцию `getMessageText(msg)`, которая возвращает строку.

```ts
type TextMessage = { type: "text"; text: string };
type ImageMessage = { type: "image"; url: string; alt?: string };
type Message = TextMessage | ImageMessage;

function getMessageText(msg: Message): string {
  // TODO: для text — text, для image — alt ?? url
}
```

**Эталон:**

```ts
function getMessageText(msg: Message): string {
  if (msg.type === "text") return msg.text;
  return msg.alt ?? msg.url;
}
```

**Follow-up:** Добавь `assertNever` в default, чтобы при новом type ломалась компиляция.

---

## Задача B (средняя): generic `pluck` / `pick`

**Условие:** Реализуй типобезопасный `pluck`:

```ts
function pluck<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const user = { id: "1", name: "Ada", age: 30 };
const preview = pluck(user, ["id", "name"]);
// тип: { id: string; name: string }
```

**На что смотреть:** `K extends keyof T`, `Pick<T, K>`, без `any`.

**Упрощение:** версия с одним ключом `pluck(obj, key): T[K]`.

---

## Задача C (средняя): упрощённый `Omit` / `Partial` своими руками

**Условие:** Напиши тип `MyPartial<T>` и `MyOmit<T, K>`.

```ts
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// или mapped + as / never-фильтрацией — достаточно Exclude-варианта
```

**Follow-up:** `MyReadonly<T>`.

---

## Задача D (практика React/API): типизация обёртки fetch

**Условие:** Напиши функцию `apiGet<T>(url: string): Promise<T>` и объясни риски. Затем улучши до `unknown` + schema callback.

```ts
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>; // честно сказать: это assertion
}

async function apiGetSafe<T>(
  url: string,
  parse: (data: unknown) => T
): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  const data: unknown = await res.json();
  return parse(data);
}
```

**На что смотреть:** понимает ли, что generic без валидации — только «обещание» вызывающего.

---

## Задача E (harder, по желанию): `ReturnType` / DeepPartial

```ts
type MyReturnType<F extends (...args: any) => any> = F extends (
  ...args: any
) => infer R
  ? R
  : never;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```

Бери только если B–C легко и кандидат тянет advanced.

---

# Шпаргалка ментора: порядок «на одном дыхании»

1. Зачем TS / erase типов  
2. `any` vs `unknown` vs `never`  
3. Union + narrowing (+ discriminated)  
4. `type` vs `interface` (+ почему нужны union / mapped / conditional)  
5. Generics (+ пример в React)  
6. `Partial` / `Pick` / `Omit` / `Record`  
7. `keyof` + `pluck` (на словах или кодом)  
8. React props / events  
9. ★ Live-coding: A или B или D  

Сильный кандидат → conditional/`infer`/DeepPartial.  
Слабый → не мучай mapped; дай задачу A и разберите narrowing.

---

# Мини-чеклист оценки

- [ ] Понимает compile-time vs runtime  
- [ ] any / unknown / never  
- [ ] Union + narrowing  
- [ ] type vs interface  
- [ ] Generics  
- [ ] Utility types (Partial/Pick/Omit/Record)  
- [ ] keyof / typeof (базово)  
- [ ] React-типизация props/events  
- [ ] Live-coding (если был)

**Вердикт Middle:**
- **уверенный Middle** — generics + narrowing + utility уверенно, React props без `any`, задачу A/B решает;
- **слабый Middle** — знает слова, но всё кастует `as`, union не сужает, utility путает;
- **сильный Middle+** — сам пишет mapped/conditional, говорит про validation boundary и strictNullChecks.

---

# Связки с соседними блоками

**После JS:**  
«Замыкания и this вы уже прошли — в TS смотрим, как описать контракты этих функций и не потерять типы в колбэках».

**Перед / рядом с React:**  
`useState<T>`, props, события, `ComponentProps`, generic-списки — естественный мост.

**Дальше по серии:** `03-react-interview.md` (если ещё не сделан — логичный следующий файл).

---

*Конец гайда по TypeScript.*
