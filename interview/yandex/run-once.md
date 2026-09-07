# `runOnce` — функция-обёртка (один вызов)

## Условие

Реализовать функцию-обёртку `runOnce`, которая принимает функцию и возвращает новую функцию.

- Новая функция может быть вызвана только один раз; все последующие вызовы возвращают `undefined`.
- Оборачиваемая функция может принимать аргументы и возвращать результат.

## Пример

```js
const logHello = (name) => {
  console.log(`hello, ${name}!`);
};

const logHelloOnce = runOnce(logHello);

logHelloOnce("Oleg"); // 'hello, Oleg!'
logHelloOnce("Olga"); // undefined
```

## Решение

```js
function runOnce(fn) {
  let called = false;

  return function (...args) {
    if (called) return undefined;
    called = true;
    return fn.apply(this, args);
  };
}
```

### Как работает

1. В замыкании флаг `called` — вызывали ли уже обёртку.
2. Первый вызов: `called = false` → ставим `true`, вызываем `fn` с аргументами и тем же `this`.
3. Все следующие вызовы: сразу `return undefined`, `fn` больше не трогаем.

`apply(this, args)` нужен, чтобы обёртка корректно работала как метод объекта (`obj.method()`), а не только как свободная функция.

### Альтернатива (без сохранения `this`)

Если `this` не важен:

```js
function runOnce(fn) {
  let called = false;

  return (...args) => {
    if (called) return;
    called = true;
    return fn(...args);
  };
}
```

`return;` без значения тоже даёт `undefined`.
