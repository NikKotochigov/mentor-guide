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

В TypeScript **Union** (объединение) и **Intersection** (пересечение) — это операторы для создания новых типов из уже существующих.

Если коротко:
- **Union** `|` означает «**ИЛИ**». Переменная может быть **одним из указанных типов**.
- **Intersection** `&` означает «**И**». Объект должен **объединять в себе свойства всех указанных типов**.

#### 1) Union Types (`|`)

Оператор `|` говорит, что значение принадлежит к типу `A` **или** к типу `B`.

```ts
type ID = string | number; // ID может быть либо строкой, либо числом

let userId: ID = 101;      // ok
userId = "id_999";         // ok
// userId = true;          // ошибка: boolean не входит в string | number
```

Когда использовать union:
- для **гибких аргументов функций**, когда функция может принимать разные форматы данных;
- для **literal types**, когда вместо широкого `string` задаём конкретный набор значений;
- для **discriminated unions**, когда у объектов есть общее поле, по которому их можно различить.

```ts
type Status = "success" | "error" | "pending";

type NetworkState =
  | { status: "loading" }
  | { status: "failed"; error: Error }
  | { status: "success"; data: string };
```

#### 2) Intersection Types (`&`)

Оператор `&` складывает типы вместе. Новый тип будет содержать **все свойства** всех объединённых типов.

```ts
type Person = { name: string };
type Employee = { employeeId: number };

type Staff = Person & Employee;

const developer: Staff = {
  name: "Алексей",
  employeeId: 404,
};
```

Когда использовать intersection:
- для **расширения и композиции типов**, когда нужно взять существующий тип и добавить к нему новые поля;
- для **плагинов и миксинов**, когда объединяем базовый контракт с дополнительными возможностями;
- для **props** в React/Vue, когда нужны стандартные атрибуты плюс кастомные свойства.

```ts
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading: boolean;
};
```

#### Главный подвох

Названия **union** и **intersection** пришли из теории множеств, поэтому на объектах они часто интуитивно воспринимаются наоборот.

При `A | B` для объектов TypeScript разрешит напрямую обратиться только к **общим полям**, которые есть и в `A`, и в `B`.
Чтобы достучаться до уникальных полей, нужно сделать **narrowing**:

```ts
if ("error" in state) {
  console.log(state.error);
}
```

При `A & B` получается “супер-объект”, у которого доступны **все поля** обоих типов сразу.

| Оператор | Символ | Логика | Что доступно без проверок? |
|---|---|---|---|
| Union | `|` | ИЛИ | только общие свойства |
| Intersection | `&` | И | все свойства обоих типов |

Ловушки:
- `string & number` → `never`, потому что такого значения не существует;
- если в intersection есть одноимённые поля с несовместимыми типами, пересечение может сломаться;
- слишком широкий union без narrowing заставляет постоянно писать проверки.

**Красные флаги:**
- путает `|` и `&`;
- думает, что `A | B` для объектов автоматически даёт доступ ко всем полям;
- не знает, что для union объектов почти всегда нужен narrowing.

**Follow-up:** Что такое discriminated union и почему поле `status` или `type` удобно?  
→ Потому что по одному литеральному полю можно сузить тип всего объекта.

---

### 4. Что такое type narrowing? Какие есть способы сузить тип?

**Зачем спрашивают:** критично для Middle; без этого union/`unknown` бесполезны. На РФ-собесах часто просят перечислить способы и показать на примере.

**Эталонный ответ (для ментора):**

Type Narrowing (сужение типов) — это процесс в TypeScript, при котором компилятор на основе логических проверок в коде (в рантайме) определяет более конкретный тип переменной из нескольких возможных.

Когда переменная изначально объявлена как объединение (Union, например `string | number`), TypeScript не разрешает использовать методы, уникальные для строки или числа. Сужение типов «доказывает» компилятору, какой именно тип находится в переменной в данном блоке кода, что открывает доступ к специфичным методам этого типа.

🛡 Все основные способы сужения типов
TypeScript умеет анализировать стандартные javascript-конструкции и автоматически сужать типы внутри блоков `if`, `switch` и циклов.

1. Оператор `typeof` (для примитивов)
Используется для проверки базовых типов данных (строки, числа, булевы значения и т.д.).

```ts
function process(value: string | number) {
  if (typeof value === "string") {
    // Внутри этого блока value имеет тип string
    console.log(value.toUpperCase());
  } else {
    // Здесь TypeScript уверен, что value — это number
    console.log(value.toFixed(2));
  }
}
```

Используйте код с осторожностью.

2. Оператор `in` (для свойств объектов)
Позволяет проверить, существует ли определенное свойство внутри объекта.

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // Тип сужен до Fish
  } else {
    animal.fly(); // Тип сужен до Bird
  }
}
```

Используйте код с осторожностью.

3. Оператор `instanceof` (для классов и экземпляров)
Проверяет, был ли объект создан с помощью конкретного конструктора/класса.

```ts
function logDate(date: string | Date) {
  if (date instanceof Date) {
    console.log(date.toUTCString()); // Тип сужен до Date
  } else {
    console.log(date.trim()); // Тип сужен до string
  }
}
```

Используйте код с осторожностью.

4. Размеченные объединения (Discriminated Unions)
Паттерн, при котором у каждого типа в объединении есть общее поле-маркер с конкретным литеральным значением (например, `type` или `kind`).

```ts
type Success = { status: "success"; data: string };
type Failure = { status: "error"; error: Error };

function handleResponse(res: Success | Failure) {
  // Сужение через switch по полю-маркеру
  switch (res.status) {
    case "success":
      console.log(res.data); // Доступно только для Success
      break;
    case "error":
      console.log(res.error); // Доступно только для Failure
      break;
  }
}
```

Используйте код с осторожностью.

5. Проверка на равенство (`===`, `!==`, `switch`)
TypeScript сужает типы, если переменная сравнивается с конкретным значением (например, с `null` или фиксированной строкой).

```ts
function clean(value: string | null) {
  if (value !== null) {
    console.log(value.toLowerCase()); // value: string
  }
}
```

Используйте код с осторожностью.

6. Пользовательские защитники типа (Type Predicates)
Функции, которые возвращают булево значение, но в качестве типа возвращаемого значения используют синтаксис `arg is Type`. Это заставляет TypeScript верить результату функции.

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function uppercase(x: unknown) {
  if (isString(x)) {
    console.log(x.toUpperCase()); // x автоматически стал string
  }
}
```

Используйте код с осторожностью.

7. Проверка на истинность (Truthiness narrowing)
Сужение типа при проверке переменной в логическом контексте (удаление `null` или `undefined` из возможных типов).

```ts
function printWords(words: string[] | null | undefined) {
  if (words) {
    // убрали null и undefined, остался только массив
    console.log(words.length);
  }
}
```

Используйте код с осторожностью.

📊 Сводная таблица применения

| Инструмент | Для чего лучше всего подходит? | Пример проверки |
|---|---|---|
| `typeof` | Различение примитивов (`string`, `number`, `boolean`) | `typeof x === "number"` |
| `in` | Различение обычных объектов по уникальным ключам | `"key" in obj` |
| `instanceof` | Различение классов, встроенных объектов (Date, RegExp) | `x instanceof Date` |
| Литеральное поле | Различение объектов в больших архитектурах (API, State) | `switch (obj.type)` |
| Type Predicate | Вынесение сложной логики проверки в отдельные функции | `function isUser(x): x is User` |

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

В TypeScript `type` (псевдоним типа) и `interface` (интерфейс) похожи: оба описывают “форму” объектов или сигнатуры. Но возможности различаются.

Коротко про главное отличие:
- **`interface`** — чаще про структуру объекта и может **расширяться/сливаться**.
- **`type`** — универсальнее: может описывать примитивы, union/intersection, кортежи и “вычисляемые” типы; при этом **не поддерживает merging**.

📊 Главные отличия

1. **Слияние деклараций (Declaration Merging)**
- `interface`: поддерживает автоматическое слияние. Два интерфейса с одинаковым именем объединяются.
- `type`: не поддерживает слияние. Объявление двух `type` с одинаковым именем даст ошибку Duplicate identifier.

```ts
interface Window {
  customProp: string;
}
interface Window {
  anotherProp: number;
} // ✅ они объединятся

type User = { name: string };
type User = { age: number }; // ❌ Duplicate identifier
```

Используйте код с осторожностью.

2. **Возможности моделирования данных**
- `interface`: в основном про **форму объектов** (а также может описывать функции/классы).
- `type`: может описывать что угодно, включая union/intersection и сложные вычисления типов.

```ts
type ID = string | number; // ✅ Union (нельзя сделать через interface)
type Point = [number, number]; // ✅ Кортеж
```

Используйте код с осторожностью.

3. **Синтаксис расширения**
- `interface` расширяется через `extends`.
- `type` расширяется через пересечение `&` (композиция типов).

```ts
// Расширение интерфейса
interface Animal {
  name: string;
}
interface Bear extends Animal {
  honey: boolean;
}

// Расширение типа
type AnimalType = { name: string };
type BearType = AnimalType & { honey: boolean };
```

Используйте код с осторожностью.

🛠 Сравнение на практике

| Критерий | `interface` | `type` |
|---|---|---|
| Что может описывать | Обычно объекты/сигнатуры | Любые типы: union, intersection, tuple, вычисления |
| Declaration merging | Да | Нет |
| Расширение | `extends` | `&` (пересечение) |
| Union / tuple | Нельзя напрямую | Да |
| `implements` в class | удобно | тоже можно, если тип описывает объект |

🤔 Что выбрать?

Best Practice: используйте `interface` по умолчанию, пока вам не понадобятся специфические возможности `type`.

Выбирайте `interface`, если:
- описываете публичный API/библиотеку/плагин, который должны расширять внешние разработчики (через declaration merging);
- описываете сущности приложения как “классические” объекты;
- хотите использовать этот контракт в `implements`.

Выбирайте `type`, если:
- нужен **union** или **intersection** типов;
- нужен примитив/кортеж (например, `type Price = number`, `type Coordinates = [number, number]`);
- нужны продвинутые возможности TypeScript: `Mapped Types` (`Record`, `Partial`), `Conditional Types` (`T extends U ? X : Y`) и другие type-level утилиты.

**Красные флаги:**
- говорить “`interface устарел`”;
- говорить “`type нельзя для объектов`”;
- не уметь привести пример, когда нужен именно `type` (union/mapped/conditional) или наоборот — когда нужен `interface` (merging/расширяемость публичных контрактов).

**Follow-up:** Что такое declaration merging и где оно реально нужно (augment для `Window` и библиотек)?

---

### 7. Как работает `extends` у интерфейсов и constraints у generics? Это одно и то же?

**Эталонный ответ:**

Слово одно — смыслы разные. На собесе важно явно разделить.

#### 1) `extends` у интерфейсов (наследование / расширение)

Здесь `extends` работает как классическое наследование. Он берет все свойства родительского интерфейса и позволяет дописать дополнительные поля.

```ts
interface Animal {
  name: string;
}

// Переносим `name` и добавляем `honey`
interface Bear extends Animal {
  honey: boolean;
}

const winnie: Bear = {
  name: "Винни",
  honey: true, // ✅ обязаны указать оба поля
};
```

Используйте код с осторожностью.

#### 2) Constraints у generics (ограничения дженериков)
В дженериках синтаксис `T extends Something` не создает новый тип. Он ставит жесткое условие (контракт) для функции или класса: “Ты можешь передать сюда любой тип `T`, но он обязан быть совместим с типом `Something`” (то есть иметь как минимум нужный набор свойств).

```ts
interface HasLength {
  length: number;
}

// Ограничиваем `T`: он обязан иметь свойство `length`
function logLength<T extends HasLength>(item: T): void {
  console.log(item.length); // ✅ теперь TS разрешает обратиться к length
}

logLength("Привет"); // ✅ работает
logLength([1, 2, 3]); // ✅ работает
logLength({ length: 10 }); // ✅ работает

// logLength(42); // ❌ Ошибка: у числа нет свойства length
```

Используйте код с осторожностью.

📊 Сравнение: в чем принципиальная разница?

```ts
interface User {
  id: number;
  name: string;
}

// 1) Способ без дженерика (просто interface)
function updateWithInterface(obj: User): User {
  return obj;
}

// 2) Способ с constraint дженерика (Generic Constraint)
function updateWithGeneric<T extends User>(obj: T): T {
  return obj;
}

const admin = { id: 1, name: "Петр", role: "admin" };

const res1 = updateWithInterface(admin); // тип res1 = User (поле role потеряется)
const res2 = updateWithGeneric(admin); // ✅ тип res2 = typeof admin (role сохранится)
```

Используйте код с осторожностью.

⚖️ Итоговая шпаргалка

| Критерий | `extends` у интерфейсов | `extends` у дженериков (constraints) |
|---|---|---|
| Что делает? | Создает новый тип, копируя свойства старого | Проверяет переданный тип на соответствие контракту |
| Зачем нужен? | Чтобы избежать дублирования полей при проектировании моделей данных | Чтобы безопасно работать со свойствами внутри универсальных функций/классов |
| Что на выходе? | Новый, более “тяжёлый” интерфейс | Тот же самый тип, который пришел на вход (без потери уникальных свойств) |

---

## Блок 4. Generics

*Сердце Middle TS. Связка: вместо any — параметр типа; связан с unknown и constraints.*

### 8. Что такое generics? Зачем они нужны? Пример

**Зачем спрашивают:** must-have для Middle.

**Эталонный ответ:**

Generics (дженерики, или универсальные типы) — это инструмент TypeScript, который позволяет создавать компоненты (функции, интерфейсы или классы), работающие с различными типами данных, сохраняя при этом строгую типизацию и безопасность.

Простыми словами: дженерики позволяют передавать типы данных как аргументы (переменные) в другие типы, функции или классы. Они работают как «шаблоны» или «чертежи».

❓ Зачем они нужны?

Без дженериков перед разработчиком встает дилемма:
- либо писать отдельную функцию под каждый тип данных (дублирование кода),
- либо использовать `any` (потеря контроля со стороны TypeScript).

Дженерики решают три главные задачи:
- Переиспользование кода: одна функция может обрабатывать и строки, и числа, и кастомные объекты.
- Сохранение точного типа: в отличие от `any`, дженерик запоминает, какой именно тип в него передали, и гарантирует, что на выходе будет именно он.
- Безопасность на этапе компиляции: TypeScript не позволит случайно вызвать метод строки у числа.

🛠 Пример из жизни: функция-обертка

Представьте, что вам нужно написать функцию, которая принимает значение и возвращает объект-коробку с этим значением внутри.

❌ Плохой подход №1 (Дублирование кода):

```ts
function wrapNumber(value: number) {
  return { content: value };
}

function wrapString(value: string) {
  return { content: value };
}
```

Используйте код с осторожностью.

❌ Плохой подход №2 (Использование `any`):

```ts
function wrapAny(value: any) {
  return { content: value };
}

const box = wrapAny("Привет");
// ❌ TypeScript думает, что box.content — это any.
// Мы потеряли автодополнение методов строки (.toUpperCase() и т.д.)
```

Используйте код с осторожностью.

✅ Правильный подход (С использованием Generics):

Мы используем специальный параметр-букву (обычно `<T>`, от слова Type), который выступает в роли переменной для типа.

```ts
function wrapInBox<T>(value: T) {
  return { content: value };
}

// 1) Передаем строку
const stringBox = wrapInBox<string>("Привет");
// TypeScript точно знает, что stringBox.content — это string

// 2) Передаем число (TS может сам догадаться о типе)
const numberBox = wrapInBox(42);
// TypeScript автоматически вывел тип: numberBox.content — это number
```

Используйте код с осторожностью.

💡 Продвинутый пример: Интерфейсы и Массивы

Дженерики очень часто используются для описания ответов от сервера, где общая структура (status, error) одинаковая, а сами данные (data) всегда разные.

```ts
// Универсальная структура ответа API
interface ApiResponse<DataShape> {
  status: "success" | "error";
  data: DataShape;
  error?: string;
}

// Типы для конкретных данных
interface User {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
}

// Переиспользуем интерфейс для разных запросов
const userResponse: ApiResponse<User> = {
  status: "success",
  data: { id: 1, name: "Алексей" },
};

const productResponse: ApiResponse<Product[]> = {
  status: "success",
  data: [{ id: 101, title: "Клавиатура", price: 3000 }],
};
```

Используйте код с осторожностью.

📊 Разница между `any`, `unknown` и `Generic <T>`

| ТипСохраняет исходный тип? | Безопасен? | Зачем нужен? |
|---|---|---|
| `any` | Нет | ❌ Отключение проверок TypeScript (крайний случай) |
| `unknown` | Нет | ✅ Для данных, тип которых мы вообще не знаем (нужен narrowing) |
| `Generic <T>` | Да | ✅ Для создания гибких, но строго типизированных компонентов |

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

Enums (перечисления) в TypeScript — одна из немногих фич, которая генерирует **реальный JavaScript-код** после компиляции (а не просто исчезает, как интерфейсы или типы). Из-за особенностей своей реализации в современном коде они часто считаются антипаттерном.

➕ Плюсы Enums:
- Самодокументируемый код: группируют связанные константы в единую структуру.
- Строгая типизация: переменная с типом энума принимает только значения из этого энума.
- Автодополнение в IDE: подсказки через точку (`Direction.Up`).

➖ Минусы Enums:

1. **Генерация лишнего кода**: обычные энумы компилируются в IIFE-функции с reverse mapping.

2. **Небезопасность числовых Enums**: TypeScript позволяет присвоить переменной любое число, даже если его нет в списке:

```ts
enum Status { Pending, Success }
let current: Status = 999; // ✅ Ошибка НЕ возникнет!
```

Используйте код с осторожностью.

3. **Номинальная типизация**: строковый энум не принимает обычную строку с тем же значением:

```ts
enum Role { Admin = "ADMIN" }
function check(role: Role) {}

check("ADMIN"); // ❌ Ошибка! Требуется именно Role.Admin
```

Используйте код с осторожностью.

4. **Проблемы с Tree-shaking**: из-за IIFE сборщики часто не могут удалить неиспользуемый код.

🛠 Чем заменить Enum?

**1) Union of Literal Types — лучший выбор по умолчанию**

```ts
type Direction = "Up" | "Down" | "Left" | "Right";

let move: Direction = "Up"; // ✅ строго, лаконично, безопасно
// move = "North"; // ❌ ошибка компиляции
```

Используйте код с осторожностью.

Плюсы: 0 строк в скомпилированном JS (бандл меньше), стандартная структурная типизация, полная поддержка IDE.

**2) Объект с `as const` — если нужны значения в рантайме**

Если нужно перебирать значения в цикле, получать ключи или использовать структуру как реальный JS-объект:

```ts
const STATUS = {
  Pending: "PENDING",
  Success: "SUCCESS",
  Error: "ERROR",
} as const;

// Тип на основе значений объекта
type Status = (typeof STATUS)[keyof typeof STATUS]; // "PENDING" | "SUCCESS" | "ERROR"

function handleStatus(status: Status) {}

handleStatus(STATUS.Success); // ✅ через объект
handleStatus("SUCCESS"); // ✅ напрямую строкой (в отличие от Enum!)
```

Используйте код с осторожностью.

Плюсы: идеальный tree-shaking, привычный синтаксис через точку, полная безопасность типов, компилируется в обычный плоский JS-объект.

📊 Сводное сравнение

| Критерий | Обычный `enum` | Union (`type`) | Объект `as const` |
|---|---|---|---|
| Есть в рантайме (в JS)? | Да (тяжелый IIFE) | Нет (0 байт в бандле) | Да (лёгкий объект) |
| Принимает чистые строки? | Нет | Да | Да |
| Безопасен для чисел? | Нет | Да | Да |
| Tree-shaking? | Нет | Да | Да |

---

## Блок 6. Практика: TypeScript в React

*Вопросы о том, как TS реально используется в повседневной фронтенд-разработке.*

### 15. Как типизировать props компонента? Как пробросить нативные атрибуты?

**Эталонный ответ:**

Props описываются через `type` (или `interface`) и деструктурируются в аргументе функции.

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

Используйте код с осторожностью.

Если нужно принять **все** нативные атрибуты кнопки + свои кастомные:

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

Используйте код с осторожностью.

Ключевые типы:
- `React.ReactNode` — всё, что можно отрендерить (string, null, элементы, массивы).
- `React.ComponentPropsWithoutRef<"tag">` — все атрибуты нативного элемента без ref.
- `React.ComponentPropsWithRef<"tag">` — то же + ref (для `forwardRef`-компонентов).
- `React.CSSProperties` — объект inline-стилей.

Почему **не** `React.FC`:
- исторически добавлял неявные `children`;
- плохо стыкуется с generic-компонентами;
- лучше явные props + деструктуризация.

---

### 16. Как типизировать хуки: useState, useRef, кастомные хуки?

**Эталонный ответ:**

**`useState`** — generic, тип выводится из начального значения или задаётся явно:

```ts
const [count, setCount] = useState(0); // number
const [user, setUser] = useState<User | null>(null); // явно, т.к. начальное — null
```

Используйте код с осторожностью.

**`useRef`** — два сценария:

```ts
// 1) Для DOM-элемента (React управляет ref)
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current — HTMLInputElement | null

// 2) Для мутабельного значения (мы управляем сами)
const timerRef = useRef<number | null>(null);
timerRef.current = window.setTimeout(() => {}, 1000);
```

Используйте код с осторожностью.

**Кастомный хук с generic:**

```ts
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Использование — T выводится из `initial`
const [theme, setTheme] = useLocalStorage("theme", "light");
// theme: string, setTheme: Dispatch<SetStateAction<string>>
```

Используйте код с осторожностью.

`as const` на return нужен, чтобы TypeScript вернул кортеж `[T, SetState<T>]`, а не `(T | SetState<T>)[]`.

---

### 17. Как типизировать события в React?

**Эталонный ответ:**

React предоставляет generic-типы событий: `React.ChangeEvent<T>`, `React.MouseEvent<T>`, `React.FormEvent<T>`, `React.KeyboardEvent<T>` и т.д., где `T` — тип HTML-элемента.

```ts
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value); // TS знает, что target — это input
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
}

function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log(e.clientX, e.clientY);
}
```

Используйте код с осторожностью.

Inline-обработчики в JSX типизируются автоматически:

```tsx
<input onChange={(e) => {
  // e уже типизирован как React.ChangeEvent<HTMLInputElement>
  console.log(e.target.value);
}} />
```

Используйте код с осторожностью.

Частая ошибка — путать `e.target` и `e.currentTarget`:
- `currentTarget` — элемент, на котором повешен обработчик (всегда типизирован по `T`).
- `target` — элемент, на котором произошло событие (может быть дочерним, тип менее точный).

---

### 18. Как типизировать ответ от сервера? Почему `as User` — плохо?

**Эталонный ответ:**

TypeScript работает **только на этапе компиляции**. В рантайме `fetch().json()` возвращает `any`/`unknown` — компилятор не может гарантировать форму данных из сети.

❌ Плохой подход (`as` — ложь компилятору):

```ts
type User = { id: string; name: string };

const res = await fetch("/api/user");
const user = (await res.json()) as User;
// Если бэк вернёт { id: 123, username: "test" } — runtime-краш
```

Используйте код с осторожностью.

✅ Правильный подход — валидация на границе системы:

```ts
// 1) Ручной type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    typeof (data as User).id === "string" &&
    typeof (data as User).name === "string"
  );
}

const data: unknown = await res.json();
if (!isUser(data)) throw new Error("Invalid user response");
// data: User — безопасно

// 2) Schema-библиотека (zod, valibot, yup) — предпочтительно
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type User = z.infer<typeof UserSchema>;
const user = UserSchema.parse(await res.json()); // User или throw
```

Используйте код с осторожностью.

Зачем schema-библиотека:
- **один source of truth**: runtime-проверка + статический тип без дублирования.
- `z.infer<typeof Schema>` автоматически выводит TS-тип из схемы.
- при изменении контракта бэка — сразу падает в рантайме с понятной ошибкой, а не молча ломает UI.

Правило: `as` допустим только когда данные **уже проверены** иначе (например, внутри type guard или после `parse`).

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
