# Мок-интервью: JavaScript (Frontend / React)

**Уровень:** Middle (универсальный)  
**Язык:** русский  
**Длительность блока:** 45–60 мин  
**Live-coding:** опционально (в конце или вместо части теории)

---

## Как проводить

### Сценарий
1. Коротко представиться, сказать что блок про JS (~45–60 мин).
2. Идти по блокам 1→6 по порядку — сложность растёт, темы связаны.
3. Если кандидат уверенно отвечает — брать **follow-up**. Если буксует — **упрощение** или следующий блок.
4. Live-coding — только если осталось время **или** теория слабая и хочется проверить руками.
5. В конце 2–3 минуты фидбека: сильные стороны + 1–2 зоны роста.

### Тайминг (ориентир)

| Блок | Тема | Время |
|------|------|-------|
| 1 | Типы, равенство, приведение | 5–7 мин |
| 2 | Scope, hoisting, замыкания | 8–10 мин |
| 3 | `this`, call/apply/bind, стрелки | 7–8 мин |
| 4 | Event loop, Promise, async/await | 10–12 мин |
| 5 | Прототипы, классы, объекты | 7–8 мин |
| 6 | ES6+, практические паттерны | 5–7 мин |
| ★ | Live-coding (опционально) | 15–20 мин |

### Как оценивать Middle

| Уровень ответа | Признаки |
|----------------|----------|
| **Сильный** | Объясняет «почему», приводит примеры, сам упоминает edge cases, спокойно идёт на follow-up |
| **Средний (норма для Middle)** | Знает определение и типичный кейс, может чуть запутаться в деталях, после наводящего вопроса выправляется |
| **Слабый** | Только названия/заученные фразы, не может применить на примере, путает смежные концепции |

**Ожидание Middle:** уверенные блоки 1–4, приемлемый блок 5, блок 6 и live-coding — плюс, не обязательный максимум.

---

# Вопросы с ответами

---

## Блок 1. Типы, равенство, приведение типов

*Разминка. Проверяем базу, на которой держится всё остальное.*

### 1. Какие типы данных есть в JavaScript? Чем примитивы отличаются от объектов?

**Зачем спрашивают:** базовая гигиена; без этого сложно говорить про сравнение, копирование, `this`.

**Эталонный ответ (для ментора):**

В современном JS есть примитивы:
- `string`, `number`, `bigint`, `boolean`, `symbol`, `undefined`, `null`
- и объекты: обычные объекты, массивы, функции, даты, `Map`/`Set` и т.д. (всё, что не примитив).

**Примитивы:**
- хранят само значение;
- неизменяемы (immutable) — операции создают новое значение;
- сравниваются **по значению**;
- при работе «как с объектом» (`"hi".toUpperCase()`) движок временно делает *boxing* (обёртку), потом выбрасывает.

**Объекты:**
- хранят ссылку на структуру в памяти;
- сравниваются **по ссылке**;
- изменяемы (если не заморожены).

Нюанс: `typeof null === "object"` — исторический баг языка. `typeof function` → `"function"` (особый случай объекта). `typeof []` → `"object"`.

**Хороший ответ кандидата (1–2 мин):**
Перечисляет примитивы + object, объясняет value vs reference, упоминает баг с `null`.

**Красные флаги:**
- Не знает `symbol` / `bigint` (для Middle допустимо забыть один, но не оба и не путать смысл).
- Говорит «массив — отдельный тип» без оговорки, что это объект.
- Путает `undefined` и `null`.

**Follow-up:** Чем `null` отличается от `undefined`?  
→ `undefined` — значение не задано (нет значения / нет свойства / нет return). `null` — явное «пусто» от программиста.

**Упрощение:** «Как скопировать число и как скопировать объект? В чём разница?»

---

### 2. В чём разница между `==` и `===`? Что такое приведение типов?

**Зачем спрашивают:** классика любого РФ-собеса; ловит тех, кто пишет на автопилоте.

**Эталонный ответ:**

- `===` (strict equality) — без приведения типов. Разные типы → сразу `false`.  
  `5 === "5"` → `false`, `null === undefined` → `false`.
- `==` (loose equality) — с приведением по правилам абстрактного алгоритма равенства.  
  `5 == "5"` → `true`, `null == undefined` → `true`, `0 == false` → `true`.

Приведение (coercion) бывает:
- **явное:** `String(x)`, `Number(x)`, `Boolean(x)`, `!!x`;
- **неявное:** `==`, `+` со строкой, `if (value)`, шаблонные строки и т.д.

Правило Middle: в коде почти всегда `===` / `!==`. `==` допустим осознанно, чаще всего только для `value == null` (проверка на `null` и `undefined` сразу).

Truthy / falsy:
- falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`;
- всё остальное — truthy, включая `[]` и `{}`.

**Красные флаги:**
- «`==` сравнивает значения, `===` ещё и типы» — слишком грубо, без понимания coercion.
- Не знает, что `[] == false` → `true` (через ToNumber).

**Follow-up:** Что выведет `[] + []`, `[] + {}`, `{} + []`?  
→ `""`, `"[object Object]"`, и для `{} + []` в statement-позиции `{}` может быть блоком → часто `0` (зависит от контекста). Не обязательно требовать идеал — смотрим ход мысли.

**Упрощение:** «Почему в линтерах запрещают `==`?»

---

### 3. Как работает оператор `typeof`? Какие есть сюрпризы?

**Эталонный ответ:**

`typeof` возвращает строку с типом. Сюрпризы:
- `typeof null` → `"object"`;
- `typeof []` → `"object"` (массив проверяют через `Array.isArray`);
- `typeof function(){}` → `"function"`;
- `typeof NaN` → `"number"`;
- `typeof undeclaredVariable` → `"undefined"` (не бросает ReferenceError — исключение среди операторов).

Для более точных проверок: `Array.isArray`, `Number.isNaN`, `value === null`, `instanceof` (для объектов одной realm).

**Follow-up:** Чем `instanceof` отличается от `typeof`?  
→ `instanceof` смотрит цепочку прототипов, работает с объектами; для примитивов обычно бесполезен (кроме boxed). Ломается между iframe/разными realm.

---

## Блок 2. Scope, hoisting, замыкания

*От «что храним» к «где и как видим переменные» — база для React (хуки, обработчики, stale closures).*

### 4. Чем отличаются `var`, `let` и `const`?

**Зачем спрашивают:** топ-1/топ-2 вопрос на JS-скрининге в РФ.

**Эталонный ответ:**

| | `var` | `let` | `const` |
|---|-------|-------|---------|
| Область видимости | function scope | block scope `{}` | block scope |
| Hoisting | да, инициализация `undefined` | да, но TDZ | да, но TDZ |
| Повторное объявление | можно | нельзя в той же области | нельзя |
| Переприсваивание | можно | можно | нельзя |
| Объект по `const` | — | — | ссылка константна, содержимое можно менять |

**TDZ (Temporal Dead Zone):** зона от начала блока до строки объявления `let`/`const`, где обращение к переменной даёт `ReferenceError`.

`var` «всплывает» и становится свойством `window`/функционального объекта активации (в браузере на верхнем уровне). `let`/`const` на верхнем уровне модуля/скрипта не становятся свойствами `window`.

В современном коде: `const` по умолчанию, `let` если нужна перезапись, `var` — легаси.

**Красные флаги:**
- «`const` делает объект иммутабельным».
- Не знает TDZ / block scope.
- Путает function scope и block scope.

**Follow-up:** Что выведет и почему?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// vs let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

→ `var`: 3, 3, 3 (одна переменная на цикл).  
→ `let`: 0, 1, 2 (на каждую итерацию своя привязка).

Это мост к замыканиям.

---

### 5. Что такое hoisting?

**Эталонный ответ:**

Hoisting — поведение, при котором объявления как будто «поднимаются» вверх области видимости на этапе создания контекста выполнения.

Уточнение для Middle (лучше, чем слово «поднимается»):
1. Движок сначала проходит фазу создания: регистрирует объявления.
2. Потом фазу исполнения.

На практике:
- `var x` → переменная создаётся сразу со значением `undefined`;
- `function foo() {}` (Function Declaration) → можно вызвать до объявления во всей области;
- `let`/`const` → имя резервируется, но до инициализации TDZ;
- Function Expression / стрелка: поднимается только переменная (`var`/`let`/`const`), не функция.

```js
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError (TDZ)
let b = 2;

foo(); // OK
function foo() {}

bar(); // TypeError: bar is not a function (если var bar)
var bar = function () {};
```

**Красные флаги:** «Всё поднимается вместе со значением».

---

### 6. Что такое замыкание (closure)? Приведи пример

**Зачем спрашивают:** один из самых частых вопросов; критично для React (обработчики, хуки, module pattern).

**Эталонный ответ:**

Замыкание — связка **функции** + **лексического окружения**, в котором она была создана. Функция «помнит» внешние переменные даже после того, как внешняя функция завершилась.

```js
function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const c1 = makeCounter();
const c2 = makeCounter();
c1(); // 1
c1(); // 2
c2(); // 1 — своё замыкание, свой count
```

Зачем нужно:
- инкапсуляция / приватность (до `#private` полей);
- фабрики функций, partial application;
- колбэки, обработчики событий;
- в React — функции внутри компонентов замыкают props/state (отсюда stale closure).

Важный нюанс: замыкается **переменная** (ссылка на binding), а не снимок значения на момент создания (кроме случаев с `let` в цикле, где на итерацию новый binding).

**Красные флаги:**
- Путает замыкание с областью видимости («это просто scope»).
- Не может привести свой пример.
- Думает, что замыкание — только IIFE.

**Follow-up:** Как связаны замыкания и утечки памяти?  
→ Если замыкание долго живёт (подписка, кэш, глобальный реестр) и держит большую структуру — GC не сможет её собрать.

**Упрощение:** «Почему внутренняя функция видит переменную внешней после return?»

---

## Блок 3. `this`, call/apply/bind, стрелочные функции

*Логическое продолжение: уже умеем scope/closures — теперь динамический контекст вызова.*

### 7. Как определяется `this` в JavaScript?

**Зачем спрашивают:** стабильный хит собесов; много багов в реальном коде и в классах/React (до хуков).

**Эталонный ответ:**

`this` определяется **в момент вызова** (кроме стрелок — у них лексический `this`).

Основные правила (по приоритету упрощённо):
1. **`new Fn()`** → `this` = новый объект.
2. **`obj.method()`** → `this` = `obj` (левая часть от точки).
3. **`fn.call/apply/bind`** → явная привязка.
4. **Обычный вызов `fn()`** → `undefined` в strict mode / modules; в неофициальном non-strict в браузере — `window`.
5. **Стрелка** → `this` из внешней лексической области, **не** имеет своего `this`.

Примеры-ловушки:

```js
const obj = {
  name: "Ada",
  regular() { return this.name; },
  arrow: () => this.name,
};

obj.regular(); // "Ada"
obj.arrow();   // не "Ada" (this снаружи, часто window/undefined)

const f = obj.regular;
f(); // потеря контекста → undefined / ошибка
```

В колбэках:

```js
button.addEventListener("click", obj.regular); // this = button (или undefined в зависимости), не obj
button.addEventListener("click", () => obj.regular()); // ок через замыкание
```

**Красные флаги:**
- «`this` всегда указывает на объект, где функция написана».
- Не отличает method call от извлечённой функции.

**Follow-up:** Что будет здесь?

```js
const obj = {
  g: () => this,
  h() { return () => this; }
};
```

→ `obj.g()` — внешний this. `obj.h()()` — стрелка из метода, this = obj.

---

### 8. Чем `call`, `apply` и `bind` отличаются?

**Эталонный ответ:**

Все три задают `this` для функции:
- `fn.call(thisArg, a, b, c)` — аргументы списком, **сразу вызывает**;
- `fn.apply(thisArg, [a, b, c])` — аргументы массивом, **сразу вызывает**;
- `fn.bind(thisArg, a, b)` — **возвращает новую функцию** с привязанным this (и опционально частичными аргументами), не вызывает сразу.

```js
function greet(greeting, punct) {
  return `${greeting}, ${this.name}${punct}`;
}
const user = { name: "Ada" };

greet.call(user, "Hello", "!");   // "Hello, Ada!"
greet.apply(user, ["Hi", "."]);  // "Hi, Ada."
const bound = greet.bind(user, "Hey");
bound("?"); // "Hey, Ada?"
```

`bind` можно использовать для partial application. У стрелок `call/apply/bind` **не меняют** `this`.

**Follow-up:** Можно ли перепривязать уже `bind`-нутую функцию новым `bind`?  
→ Второй `bind` не перебьёт this первой привязки (можно добавить аргументы, но this зафиксирован).

---

### 9. Чем стрелочные функции отличаются от обычных?

**Эталонный ответ:**

Стрелки:
1. Нет своего `this` — берут лексический.
2. Нет `arguments` (используют rest: `(...args)`).
3. Нельзя использовать как конструктор (`new Arrow()` → TypeError).
4. Нет `prototype`.
5. Нельзя использовать как generator (`function*` только).
6. Краткий синтаксис, неявный return в expression-форме.

Когда уместны: колбэки, методы которым нужен внешний this, компактные трансформации массивов.  
Когда нет: методы объекта, которым нужен динамический this; конструкторы; когда нужен `arguments`.

Связь с React: в классах стрелочные поля методов сохраняют this без bind в конструкторе; в функциональных компонентах стрелки в колбэках — норма, но создают новую функцию на рендер (мост к `useCallback` позже).

**Красные флаги:** «Стрелки — просто короткий синтаксис» без упоминания this/arguments/new.

---

## Блок 4. Асинхронность: event loop, Promise, async/await

*Ключевой блок для Middle. Связка: колбэки держат замыкания и this — теперь как они встают в очередь.*

### 10. Что такое event loop? Чем микротаски отличаются от макротасок?

**Зачем спрашивают:** почти обязателен на Middle+ в РФ; отделяет тех, кто «юзал async», от тех, кто понимает модель.

**Эталонный ответ:**

JS в браузере/Node **однопоточный** для вашего кода: один call stack. Долгие задачи блокируют UI/обработку.

**Event loop** координирует:
1. Выполнить синхронный код (call stack).
2. Когда стек пуст — взять задачи из очередей.

Упрощённая модель (достаточно для Middle):

**Микротаски (microtasks):**
- `Promise.then/catch/finally`
- `queueMicrotask`
- `MutationObserver`
- в Node ещё `process.nextTick` (приоритетнее обычных microtasks)

**Макротаски (macrotasks / tasks):**
- `setTimeout` / `setInterval`
- I/O, UI events
- `setImmediate` (Node, устаревающий контекст)

Порядок:
1. Синхронный код.
2. **Все** микротаски до опустошения очереди (включая те, что появились по ходу).
3. Одна макротаска.
4. Снова все микротаски.
5. (В браузере) при необходимости render.
6. Следующая макротаска…

Классический вывод:

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// 1, 4, 3, 2
```

**Красные флаги:**
- «setTimeout(fn, 0) выполнится сразу».
- Путает: думает, что Promise — отдельный поток.
- Не знает, что микротаски идут перед следующим setTimeout.

**Follow-up:** Что выведет?

```js
setTimeout(() => console.log("timeout"), 0);
Promise.resolve()
  .then(() => {
    console.log("then1");
    return Promise.resolve();
  })
  .then(() => console.log("then2"));
console.log("sync");
```

→ `sync`, `then1`, `then2`, `timeout`.

**Упрощение:** «В каком порядке выполнятся sync, promise.then и setTimeout(0)?»

---

### 11. Что такое Promise? Какие состояния? Как обработать ошибку?

**Эталонный ответ:**

Promise — объект-заглушка будущего результата асинхронной операции.

Состояния:
- `pending` — ожидание;
- `fulfilled` — успех (value);
- `rejected` — ошибка (reason).

Переход **одноразовый** и необратимый (settled).

Создание:

```js
const p = new Promise((resolve, reject) => {
  // sync-старт; resolve/reject вызвать позже
});
```

Цепочки:
- `.then` возвращает **новый** Promise;
- если вернуть значение — оно станет fulfilled-результатом следующего then;
- если вернуть Promise — произойдёт flat (присоединение);
- если бросить / вернуть rejected — поймает ближайший `.catch`.

Ошибки:

```js
fetch("/api")
  .then((r) => r.json())
  .then((data) => { /* ... */ })
  .catch((err) => { /* любая ошибка выше по цепочке */ })
  .finally(() => { /* и success, и fail */ });
```

Важно: `fetch` не reject-ит на HTTP 404/500 — только на сетевой сбой. Нужна проверка `response.ok`.

Статические методы (часто спрашивают follow-up):
- `Promise.all` — все успех / первая ошибка;
- `Promise.allSettled` — ждёт все, без short-circuit по ошибке;
- `Promise.race` — первый settled;
- `Promise.any` — первый fulfilled (ошибка только если все rejected → AggregateError).

**Красные флаги:**
- Путает Promise с «потоком».
- Не понимает, зачем цепочка then, пишет callback hell внутри then.
- Глотает ошибки без catch.

**Follow-up:** Чем `Promise.all` отличается от `allSettled`? Когда что выбрать?

---

### 12. Как работает `async/await`? Чем отличается от then-цепочек?

**Эталонный ответ:**

`async`-функция всегда возвращает Promise.
`await` ставит паузу **внутри** async-функции до settled промиса: возвращает значение или бросает исключение (удобно try/catch).

```js
async function loadUser(id) {
  try {
    const res = await fetch(`/users/${id}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
```

Отличия от then:
- читается как синхронный код;
- ошибки — через try/catch (или `.catch` на вызове);
- легко случайно сделать **последовательные** await там, где нужна параллельность:

```js
// медленно (последовательно)
const a = await fetchA();
const b = await fetchB();

// быстро (параллельно)
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

`await` «под капотом» близок к microtask-поведению Promise.

**Follow-up:** Что вернёт `async function f() { return 1; }`?  
→ Promise, fulfilled с `1`.

**Follow-up 2:** Можно ли `await` не в async?  
→ Только в top-level await в ES-модулях (или внутри async).

---

## Блок 5. Прототипы, наследование, объекты

*После функций и async — как устроены объекты «под капотом». Важно для понимания классов и библиотек.*

### 13. Что такое прототипное наследование? Чем `[[Prototype]]` отличается от свойства `prototype`?

**Зачем спрашивают:** классика middle-собесов; проверяет глубину, не только «пользовался class». Ловит путаницу `__proto__` vs `prototype`.

**Эталонный ответ (для ментора):**

В JavaScript наследование устроено **не через классы как в Java**, а через **цепочку прототипов** (prototype chain). У почти каждого объекта есть скрытая ссылка на другой объект — прототип. Если свойства/метода нет у самого объекта, движок ищет его дальше по цепочке, пока не найдёт или не дойдёт до конца (`null`).

Это и есть прототипное наследование: объекты «делятся» поведением через ссылки, а не через копирование методов в каждый экземпляр.

```js
const animal = {
  eats: true,
  walk() {
    return "walking";
  },
};

const rabbit = Object.create(animal); // [[Prototype]] rabbit → animal
rabbit.jumps = true;

rabbit.jumps; // true — своё свойство
rabbit.eats;  // true — взято из animal
rabbit.walk(); // "walking" — метод из прототипа

Object.getPrototypeOf(rabbit) === animal; // true
```

Схема lookup:

```text
rabbit  →  animal  →  Object.prototype  →  null
  ↓           ↓              ↓
jumps       eats          toString, hasOwnProperty...
            walk
```

---

#### Главная путаница: `[[Prototype]]` vs `prototype`

Это **разные вещи** с похожими именами.

| | `[[Prototype]]` | `Fn.prototype` |
|---|---|---|
| Что это | скрытая ссылка **у объекта-экземпляра** на его прототип | обычное свойство **у функции-конструктора** (и у class) |
| Зачем | цепочка поиска свойств | «шаблон», который станет `[[Prototype]]` у экземпляров при `new` |
| Как читать | `Object.getPrototypeOf(obj)`, устаревшее `obj.__proto__` | `Fn.prototype` |
| У кого есть | почти у всех объектов | у функций (callable); у стрелок/`Object.create`-объектов без конструктора — иначе |

Коротко:
- **`obj.[[Prototype]]`** — «кто мой прототип?» (связь экземпляра).
- **`Fn.prototype`** — «какой объект получат мои экземпляры как прототип?» (заготовка конструктора).

Связь между ними появляется при `new`:

```js
function User(name) {
  this.name = name; // собственное свойство экземпляра
}

User.prototype.sayHi = function () {
  return "Hi, " + this.name;
};

User.prototype.role = "user";

const u = new User("Ada");

u.name;   // "Ada" — own property
u.sayHi(); // "Hi, Ada" — метод с User.prototype
u.role;   // "user" — поле с прототипа

Object.getPrototypeOf(u) === User.prototype; // true
u.__proto__ === User.prototype;              // true (но __proto__ лучше не использовать в коде)
u.hasOwnProperty("name");  // true
u.hasOwnProperty("sayHi"); // false — метод не скопирован, он в прототипе
```

Что делает `new User(...)` упрощённо:
1. создаёт новый объект;
2. ставит ему `[[Prototype]] = User.prototype`;
3. вызывает `User` с `this =` этот объект;
4. возвращает объект (если конструктор не вернул другой объект явно).

---

#### `class` — сахар над той же моделью

```js
class User {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    return "Hi, " + this.name;
  }
}

const u = new User("Ada");
Object.getPrototypeOf(u) === User.prototype; // true
typeof User; // "function" — class всё ещё функция-конструктор
```

Отличия от «ручного» `function` + `prototype` (важно для Middle):
- методы в `class` попадают в `User.prototype`, но обычно **неenumerable**;
- class-конструктор нельзя вызвать без `new`;
- есть `extends` / `super`, которые тоже работают через прототипы (`Object.getPrototypeOf(Child.prototype) === Parent.prototype`).

```js
class Animal {
  walk() {
    return "walk";
  }
}
class Rabbit extends Animal {
  jump() {
    return "jump";
  }
}

const r = new Rabbit();
r.jump(); // own chain: Rabbit.prototype
r.walk(); // дальше: Animal.prototype
r instanceof Rabbit; // true
r instanceof Animal; // true
```

---

#### `instanceof` и цепочка

`u instanceof User` проверяет не «создан ли именно этим конструктором», а есть ли `User.prototype` **где-то в цепочке** `[[Prototype]]` у `u`.

```js
function A() {}
function B() {}
B.prototype = Object.create(A.prototype);

const b = new B();
b instanceof B; // true
b instanceof A; // true
```

Поэтому ломается между iframe / разными realm: разные `Array.prototype` → `[] instanceof Array` может быть `false`. Надёжнее `Array.isArray`.

---

#### `__proto__` vs `Object.getPrototypeOf` / `Object.setPrototypeOf`

- `__proto__` — устаревший / нестандартный по происхождению accessor (сейчас описан в спеке для совместимости), лучше не использовать в коде.
- Читать: `Object.getPrototypeOf(obj)`.
- Менять: `Object.setPrototypeOf(obj, proto)` — медленно и редко нужно; предпочтительнее задать прототип при создании через `Object.create(proto)`.

```js
const dict = Object.create(null); // нет прототипа вообще
dict.toString; // undefined — не унаследовал Object.prototype
// удобно как «чистый словарь» ключей без наследия
```

---

#### Зачем это в реальном frontend

- методы на прототипе **не дублируются** в каждом экземпляре (память);
- на этом стоят built-ins: `Array.prototype.map`, `Object.prototype.toString`;
- понимание `class`, библиотек, полифиллов, `instanceof`, ошибок вроде «потеряли прототип при structured clone / ручном копировании».

**Хороший ответ кандидата (1–2 мин):**
«Наследование через цепочку прототипов: если свойства нет — ищем в `[[Prototype]]`. `Fn.prototype` — объект для экземпляров при `new`. `Object.getPrototypeOf(u) === User.prototype`. Class — сахар. `instanceof` идёт по цепочке.»

**Красные флаги:**
- «В JS нет наследования, только копирование».
- Путает `prototype` и `__proto__` / `[[Prototype]]` и не может связать через `new`.
- Думает, что `class` — другая ООП-модель «как в Java».
- Говорит, что методы class лежат «внутри объекта экземпляра» как own properties (обычно нет).

**Follow-up:** Что делает `Object.create(null)`?  
→ Объект без прототипа — чистый словарь без `toString` / `hasOwnProperty` с цепочки.

**Follow-up 2:** Где лежит метод `sayHi` у `class User { sayHi() {} }` — у экземпляра или на `User.prototype`?  
→ На `User.prototype`; у экземпляра own обычно только поля из конструктора.

**Упрощение:** «Если у объекта нет метода, где JS его ищет?»  
→ В прототипе, потом у прототипа прототипа, пока не `null`.

---

### 14. Чем отличается копирование объектов: shallow vs deep? Как клонировать?

**Эталонный ответ:**

- **Shallow copy** — новый объект, но вложенные ссылки те же:  
  `Object.assign({}, obj)`, `{ ...obj }`.
- **Deep copy** — рекурсивно новые вложенные структуры.

Способы deep:
- `structuredClone(obj)` — современный нормальный способ (не клонирует функции, DOM-ноды ограниченно и т.д.);
- `JSON.parse(JSON.stringify(obj))` — ломает `undefined`, функции, `Date`, `Map`, циклические ссылки;
- библиотеки (`lodash.cloneDeep`) — когда нужны краевые случаи.

Связь с ранее: примитивы копируются по значению, объекты — по ссылке. Отсюда баги мутаций state в React, если мутировать вложенность.

**Follow-up:** Почему в React важно не мутировать state? Связь с копированием.

---

### 15. Что такое деструктуризация, spread и rest?

**Эталонный ответ:**

Деструктуризация — извлечение из объекта/массива:

```js
const { name, age = 18 } = user;
const [first, ...restItems] = list;
```

Spread — «развернуть» в литерал/вызов:
`{ ...a, ...b }`, `[...arr]`, `fn(...args)`.

Rest — собрать остаток в паттерне: `(...args)`, `const { id, ...rest } = obj`.

Нюансы: spread объекта — shallow; порядок важен при перекрытии ключей; rest в параметрах должен быть последним.

Для Middle достаточно уверенно объяснить на примере и отличие rest vs spread (один синтаксис `...`, разная роль).

---

## Блок 6. Паттерны, которые часто спрашивают «добивкой»

*Короткие вопросы, если есть время; связывают JS с реальной frontend-работой.*

### 16. Что такое debounce и throttle? Чем отличаются?

**Зачем спрашивают:** классика frontend Middle; связка замыканий + таймеров + практика (input, scroll). Часто дают live-coding на debounce.

**Эталонный ответ (для ментора):**

Оба приёма **ограничивают частоту вызова** функции при частых событиях. Разница — в стратегии «когда именно вызывать».

| | Debounce | Throttle |
|---|----------|----------|
| Идея | вызвать **после паузы** с последнего события | вызывать **не чаще**, чем раз в N мс |
| Метафора | «подожди, пока пользователь закончит» | «бери не чаще одного раза за окно» |
| Типичные кейсы | поиск по мере ввода, resize «в конце», автосейв | scroll, mousemove, resize «во время», кнопка «не долбить API» |
| Базовая реализация | `clearTimeout` + новый `setTimeout` | timestamp / флаг «занято» + `setTimeout` |

---

#### Debounce

Пока события сыплются — таймер сбрасывается. Функция выполнится только когда с последнего вызова прошло `delay` мс.

```js
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    const ctx = this;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(ctx, args);
    }, delay);
  };
}

const onSearch = debounce((query) => {
  // fetch(`/search?q=${query}`)
  console.log("search:", query);
}, 300);

input.addEventListener("input", (e) => onSearch(e.target.value));
```

Поведение: пользователь печатает `"react"` → запросы на каждую букву не уходят; уйдёт один, когда остановится на ~300 мс.

Варианты (follow-up):
- **trailing** (классика) — вызов в конце паузы;
- **leading** — вызов сразу при первом событии, потом игнор до паузы;
- `cancel()` — сбросить таймер (размонтирование React-компонента).

---

#### Throttle

Гарантирует: между успешными вызовами не меньше `delay`. Часть событий «прореживается», но во время активного потока вызовы всё равно происходят регулярно.

```js
function throttle(fn, delay) {
  let last = 0;
  let timerId;
  return function (...args) {
    const ctx = this;
    const now = Date.now();
    const remaining = delay - (now - last);

    if (remaining <= 0) {
      clearTimeout(timerId);
      timerId = undefined;
      last = now;
      fn.apply(ctx, args);
    } else if (!timerId) {
      // trailing-вызов в конце окна — чтобы не потерять последнее событие
      timerId = setTimeout(() => {
        last = Date.now();
        timerId = undefined;
        fn.apply(ctx, args);
      }, remaining);
    }
  };
}

window.addEventListener(
  "scroll",
  throttle(() => {
    // проверить позицию, lazy-load и т.д.
  }, 200)
);
```

Упрощённый вариант «только leading» (часто хватает на словах):

```js
function throttleSimple(fn, delay) {
  let locked = false;
  return function (...args) {
    if (locked) return;
    locked = true;
    fn.apply(this, args);
    setTimeout(() => {
      locked = false;
    }, delay);
  };
}
```

---

#### Как выбирать на собесе

- «Нужен результат, когда пользователь **закончил** действие» → debounce.
- «Нужны регулярные обновления **во время** действия» → throttle.
- Иногда комбинируют (например throttle для UI + debounce для финального запроса).

Связь с теорией: обе обёртки — **замыкание** над `timerId` / `last`; таймеры идут через **макротаски** event loop.

**Хороший ответ кандидата:** чётко отличает стратегии, приводит по кейсу, может набросать debounce на `setTimeout`/`clearTimeout`.

**Красные флаги:**
- Путает местами («throttle ждёт конца ввода»).
- Не понимает, зачем `clearTimeout` в debounce.
- Теряет `this`/`args` в обёртке.

**Follow-up:** Напиши debounce; добавь `cancel`. Чем leading отличается от trailing?  
**Упрощение:** «Поиск в инпуте: чтобы не бить API на каждую букву — что использовать?»

---

### 17. Что такое event bubbling / capturing? Как остановить всплытие?

**Зачем спрашивают:** база DOM-событий; мост к делегированию — очень частый практический вопрос на РФ-собесах.

**Эталонный ответ (для ментора):**

Когда происходит событие (click и т.д.), оно проходит **три фазы** по дереву DOM:

1. **Capturing (capture, погружение)** — от `window`/`document` вниз к целевому элементу.
2. **Target** — на самом элементе, где событие возникло.
3. **Bubbling (bubble, всплытие)** — от цели обратно вверх к корню.

```text
capture:  window → document → html → body → ul → li  (цель)
target:   li
bubble:   li → ul → body → html → document → window
```

По умолчанию `addEventListener` слушает **на фазе bubble** (третий аргумент `false` / `{ capture: false }`).

```js
parent.addEventListener("click", () => console.log("parent bubble"));
child.addEventListener("click", () => console.log("child bubble"));

// клик по child → сначала child, потом parent (всплытие)

parent.addEventListener(
  "click",
  () => console.log("parent capture"),
  true // или { capture: true }
);
child.addEventListener("click", () => console.log("child bubble"));

// клик по child → сначала parent capture, потом child bubble
```

---

#### Как остановить распространение и default

| Метод | Что делает |
|-------|------------|
| `e.stopPropagation()` | не пускает событие дальше по цепочке (остальные фазы/предки не получат) |
| `e.stopImmediatePropagation()` | то же + **не вызовет** другие слушатели на **этом же** элементе, которые ещё не сработали |
| `e.preventDefault()` | отменяет действие браузера по умолчанию (submit формы, переход по ссылке, чекбокс…). **Не** останавливает всплытие |

```js
link.addEventListener("click", (e) => {
  e.preventDefault(); // не переходить по href
  // событие всё ещё может всплыть к родителям
});

button.addEventListener("click", (e) => {
  e.stopPropagation(); // родительский click-handler не сработает
});
```

Частая ошибка кандидата: путать `preventDefault` и `stopPropagation`.

`e.cancelable` / возврат `false` в старых `onclick` — лучше не опираться; современный путь — `addEventListener` + явные методы.

---

#### Делегирование событий (почти всегда follow-up)

Вместо слушателя на каждом `li` — один на родителе, работаем с `event.target` (или `closest`):

```js
ul.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li || !ul.contains(li)) return;
  console.log("clicked item:", li.dataset.id);
});
```

Зачем:
- меньше обработчиков (память/производительность);
- работает для элементов, добавленных позже динамически;
- проще централизовать логику списка/таблицы/меню.

Нюансы:
- `event.target` — самый глубокий элемент (может быть `span` внутри `button`);
- `event.currentTarget` — элемент, на котором висит слушатель (`ul`);
- не все события всплывают одинаково хорошо (например `focus` — лучше `focusin`; `scroll` не всплывает — для делегирования scroll обычно не подходит).

**Хороший ответ кандидата:** называет фазы capture → target → bubble, отличает stopPropagation / preventDefault, приводит делегирование.

**Красные флаги:**
- Знает только «событие всплывает», не знает capture.
- Путает `preventDefault` и `stopPropagation`.
- Не отличает `target` и `currentTarget`.

**Follow-up:** Зачем делегирование? Чем `target` отличается от `currentTarget`?  
**Follow-up 2:** Что сделает `stopImmediatePropagation` при двух click-слушателях на одной кнопке?  
**Упрощение:** «Клик по кнопке внутри div — кто получит событие первым при обычном addEventListener?»  
→ Сначала кнопка, потом div (bubble).

### 18. Чем `Map`/`Set` отличаются от объекта/массива?

**Краткий эталон:**
- `Map`: ключи любых типов, сохраняет порядок вставки, удобный size, нет прототипного мусора ключей.
- `Set`: уникальные значения, быстрый has.
- `WeakMap`/`WeakSet`: слабые ссылки на объекты-ключи → не мешают GC; не итерируются.

Для Middle хватит Map/Set + зачем WeakMap (приватные данные / кэш по объекту).

---

# Live-coding (опционально)

*Включай, если: осталось 15+ минут, или теория «средняя» и нужно проверить руками, или кандидат сам просит задачу.*

**Как вести:** дать задачу → 1–2 минуты уточнений → код → проговорить сложность/края → follow-up усложнение.

Оценивай: ясность мысли, краевые случаи, умение дебажить, а не «написал идеально с первой попытки».

---

## Задача A (обязательный минимум, если берёте live-coding): замыкание + таймеры

**Условие:** Напиши функцию `createEmitter` / или проще:

Реализуй `makeFunctions`, которая возвращает массив из `n` функций; вызов `i`-й функции возвращает `i`.

```js
function createFunctions(n) {
  const funcs = [];
  // TODO
  return funcs;
}

const fs = createFunctions(5);
fs[0](); // 0
fs[3](); // 3
```

**Ловушка:** с `var i` в цикле все вернут `n`. С `let` или IIFE/factory — ок.

**Эталон:**

```js
function createFunctions(n) {
  const funcs = [];
  for (let i = 0; i < n; i++) {
    funcs.push(() => i);
  }
  return funcs;
}
```

**Альтернатива без let:**

```js
for (var i = 0; i < n; i++) {
  funcs.push((function (j) {
    return function () { return j; };
  })(i));
}
```

**Связь с теорией:** блок 2 (var/let, closures).

**Follow-up:** Почему `var` ломает? Что именно замыкается?

---

## Задача B (средняя): промисы / порядок вывода

**Условие:** Объясни вывод и/или допиши код.

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve()
  .then(() => {
    console.log("C");
    return Promise.resolve("D");
  })
  .then((v) => console.log(v));

queueMicrotask(() => console.log("E"));

console.log("F");
```

**Ожидаемый вывод:** `A F C E D B`  
(уточнение: `D` после `C` и обычно после/рядом с `E` в зависимости от того, как вложенный resolve ставит then — для Middle достаточно порядка sync → microtasks → timeout; если кандидат путает точное место `D`/`E`, дай наводящий вопрос).

Более «чистая» версия для собеса (однозначнее):

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// 1 4 3 2
```

**Follow-up:** Добавь `async` функцию с `await` и встрой в порядок.

---

## Задача C (средняя+, классика РФ): `Promise.all` своими руками

**Условие:** Реализуй `promiseAll(promises)` с поведением как `Promise.all`.

**Эталонная идея:**

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const input = [...promises];
    if (input.length === 0) {
      resolve([]);
      return;
    }
    const result = new Array(input.length);
    let done = 0;

    input.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          result[i] = value;
          done += 1;
          if (done === input.length) resolve(result);
        },
        (err) => reject(err)
      );
    });
  });
}
```

**На что смотреть:**
- сохранение порядка результатов;
- reject при первой ошибке;
- работа с non-promise значениями (`Promise.resolve`);
- пустой массив → resolve `[]`.

**Связь:** блок 4.

---

## Задача D (практика frontend): debounce

**Условие:** Напиши `debounce(fn, delay)`.

```js
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    const ctx = this;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(ctx, args);
    }, delay);
  };
}
```

**На что смотреть:** clearTimeout, сохранение this/args, понимание зачем.

**Follow-up:** Добавь `cancel()` или немедленный leading-edge вызов.  
**Follow-up 2:** Чем отличается throttle (на словах или кодом).

---

## Задача E (по желанию, harder): deepEqual или flatten

**Deep equal (упрощённо):**

```js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]));
}
```

Или **flatten массива** произвольной вложенности — тоже частая задача.

Бери E только если A–C легко и есть время.

---

# Шпаргалка ментора: порядок вопросов «на одном дыхании»

1. Типы / примитив vs объект  
2. `==` vs `===`  
3. `var` / `let` / `const` (+ цикл и setTimeout)  
4. Замыкание  
5. `this` + стрелки  
6. Event loop (порядок вывода)  
7. Promise + async/await  
8. Прототипы (кратко)  
9. ★ Live-coding: A или C или D  

Если кандидат сильный и быстро идёт — вставь follow-up из блоков, не растягивай базу.

Если слабый — не упирайся в прототипы; лучше дай задачу A и разберите вместе (как учебный момент мока).

---

# Мини-чеклист оценки после интервью

Отметь по блокам: **Сильный / Ок / Слабо**

- [ ] Типы и сравнение  
- [ ] Scope / let-const / TDZ  
- [ ] Замыкания  
- [ ] `this` / bind / стрелки  
- [ ] Event loop  
- [ ] Promise / async-await  
- [ ] Прототипы / объекты  
- [ ] Live-coding (если был)

**Вердикт Middle:**
- **уверенный Middle** — Ок/Сильный на async + closures + this, задача решена с объяснением;
- **слабый Middle / сильный Junior** — база есть, async/this дырявые, задачу делает только с подсказками;
- **сильный Middle+** — сам эскалирует нюансы, Promise.all / debounce пишет чисто, прототипы объясняет без каши.

---

# Переход к следующему блоку (React)

После JS логично идти в React так:
1. Functional components + props/state  
2. Хуки: `useState`, `useEffect` (зависимости = замыкания!)  
3. `useMemo` / `useCallback` / re-render  
4. Ключи в списках, controlled inputs  
5. Context / composition  

Явная связка: «помнишь stale closure и event loop? — вот почему массив зависимостей в useEffect важен».

---

*Конец гайда по JavaScript. Следующий файл серии можно сделать: `02-react-interview.md`.*
