# `timeLimited` — лимит времени для async-функции

## Условие

Дана асинхронная функция `fn` и время `t` в миллисекундах. Нужно вернуть новую версию этой функции, выполнение которой ограничено заданным временем. Функция `fn` принимает аргументы, передаваемые этой новой функции.

Возвращаемая функция:

- если `fn` успевает за время `t` — резолвит полученные данные;
- если не успевает — реджектит строкой `"Time Limit Exceeded"`.

```js
/**
 * @param {Function} fn
 * @param {number} t
 * @return {Function}
 */
const timeLimited = function (fn, t) {
  // your code
};
```

## Пример

```js
const limited = timeLimited(
  (n) => new Promise((res) => setTimeout(() => res(n), n)),
  100
);

limited(50).then((res) => console.log("res", res)); // res 50
limited(150).catch((e) => console.log("error", e)); // error Time Limit Exceeded
```

## Решение

```js
const timeLimited = function (fn, t) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject("Time Limit Exceeded");
      }, t);

      Promise.resolve(fn(...args))
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  };
};
```

### Как работает

1. Обёртка возвращает промис.
2. Параллельно стартуют таймер на `t` мс и вызов `fn(...args)`.
3. Если `fn` успел раньше — чистим таймер и резолвим результат.
4. Если таймер сработал первым — реджектим `"Time Limit Exceeded"`.
5. Ошибку самой `fn` тоже пробрасываем (после `clearTimeout`).

`Promise.resolve(fn(...args))` нужен на случай, если `fn` вернула не промис, а обычное значение.

### Без статических методов `Promise`

```js
const timeLimited = function (fn, t) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject("Time Limit Exceeded");
      }, t);

      fn(...args).then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  };
};
```

Здесь предполагается, что `fn` всегда возвращает промис (как в условии про асинхронную функцию).

### Вариант через `Promise.race`

```js
const timeLimited = function (fn, t) {
  return function (...args) {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject("Time Limit Exceeded"), t);
    });

    return Promise.race([fn(...args), timeout]);
  };
};
```

Короче, но таймер не очищается после успеха `fn` (для задачи обычно не критично).
