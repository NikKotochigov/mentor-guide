# Вопросы: JavaScript + TypeScript

**Уровень:** Middle  
**Язык:** русский

---

# JavaScript

## Блок 1. Типы, равенство, приведение типов

1. Какие типы данных есть в JavaScript? Чем примитивы отличаются от объектов?
2. В чём разница между `==` и `===`? Что такое приведение типов?
3. Как работает оператор `typeof`? Какие есть сюрпризы?

## Блок 2. Scope, hoisting, замыкания

4. Чем отличаются `var`, `let` и `const`?
5. Что такое hoisting?
6. Что такое замыкание (closure)? Приведи пример

## Блок 3. `this`, call/apply/bind, стрелочные функции

7. Как определяется `this` в JavaScript?
8. Чем `call`, `apply` и `bind` отличаются?
9. Чем стрелочные функции отличаются от обычных?

## Блок 4. Асинхронность: event loop, Promise, async/await

10. Что такое event loop? Чем микротаски отличаются от макротасок?
11. Что такое Promise? Какие состояния? Как обработать ошибку?
12. Как работает `async/await`? Чем отличается от then-цепочек?

## Блок 5. Прототипы, наследование, объекты

13. Что такое прототипное наследование? Чем `[[Prototype]]` отличается от свойства `prototype`?
14. Чем отличается копирование объектов: shallow vs deep? Как клонировать?
15. Что такое деструктуризация, spread и rest?

## Блок 6. Паттерны, которые часто спрашивают «добивкой»

16. Что такое debounce и throttle? Чем отличаются?
17. Что такое event bubbling / capturing? Как остановить всплытие?
18. Чем `Map`/`Set` отличаются от объекта/массива?

## Live-coding (опционально)

- A. Замыкание + таймеры (`createFunctions`)
- B. Промисы / порядок вывода
- C. `Promise.all` своими руками
- D. Debounce
- E. Deep equal или flatten

---

# TypeScript

## Блок 1. База TypeScript

1. Зачем нужен TypeScript? Чем он отличается от JavaScript?
2. В чём разница между `any`, `unknown` и `never`?

## Блок 2. Union, narrowing, литералы

3. Что такое union и intersection? Когда что использовать?
4. Что такое type narrowing? Какие есть способы сузить тип?
5. Что такое literal types? Зачем `as const`?

## Блок 3. `type` vs `interface`, union / mapped / conditional

6. Чем `type` отличается от `interface`? Что выбрать?
7. Как работает `extends` у интерфейсов и constraints у generics? Это одно и то же?

## Блок 4. Generics

8. Что такое generics? Зачем они нужны? Пример
9. Приведи пример generic в React (компонент, хук или список)
10. Что такое keyof, typeof и indexed access types?

## Блок 5. Utility types и «магия» типов

11. Какие utility types знаешь? Объясни Partial, Required, Pick, Omit, Record, Readonly
12. Что такое mapped types? Приведи простой пример
13. Что такое conditional types? Пример `T extends U ? X : Y`
14. Enum в TypeScript: плюсы/минусы. Чем заменить?

## Блок 6. Практика: TypeScript в React

15. Как типизировать props компонента? Как пробросить нативные атрибуты?
16. Как типизировать хуки: useState, useRef, кастомные хуки?
17. Как типизировать события в React?
18. Как типизировать ответ от сервера? Почему `as User` — плохо?

## Live-coding (опционально)

- A. Сужение union / type guard
- B. Generic `pluck` / `pick`
- C. Упрощённый `Omit` / `Partial` своими руками
- D. Типизация обёртки fetch
- E. `ReturnType` / DeepPartial

---

