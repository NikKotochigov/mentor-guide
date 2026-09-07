# `sumPromises` — сумма результатов промисов

## Условие

Реализовать функцию `sumPromises`, которая принимает в качестве аргументов промисы и возвращает сумму результатов их выполнения.

- Функция может принимать любое количество аргументов.
- Можно использовать любые API промисов.

## Пример

```js
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);

sumPromises(promise1, promise2).then(console.log); // 3
```

## Решение

```js
function sumPromises(...promises) {
  return Promise.all(promises).then((values) =>
    values.reduce((sum, value) => sum + value, 0)
  );
}
```

### Как работает

1. `...promises` собирает любое число аргументов в массив.
2. `Promise.all` ждёт, пока выполнятся все промисы (параллельно).
3. `reduce` складывает полученные числа и возвращает сумму.
4. Результат — новый промис, который резолвится в эту сумму.

Если хотя бы один промис реджектится, `Promise.all` тоже реджектится — сумма не считается.

### Вариант на `async/await`

```js
async function sumPromises(...promises) {
  const values = await Promise.all(promises);
  return values.reduce((sum, value) => sum + value, 0);
}
```

## Без статических методов (`Promise.all` и т.п.)

Статические методы (`Promise.all`, `Promise.resolve`, …) не используем. Можно: `new Promise`, `.then`, `await`.

### Последовательно через `async/await`

```js
async function sumPromises(...promises) {
  let sum = 0;
  for (const p of promises) {
    sum += await p;
  }
  return sum;
}
```

Каждый следующий промис ждём только после предыдущего.

### Последовательно через `.then` + `reduce`

```js
function sumPromises(...promises) {
  return promises.reduce(
    (acc, p) => acc.then((sum) => p.then((value) => sum + value)),
    new Promise((resolve) => resolve(0))
  );
}
```

Стартовое значение — обычный промис с `0`, без `Promise.resolve`.

### Параллельно (аналог `Promise.all`)

```js
function sumPromises(...promises) {
  return new Promise((resolve, reject) => {
    const { length } = promises;

    if (length === 0) {
      resolve(0);
      return;
    }

    const values = new Array(length);
    let left = length;

    promises.forEach((p, i) => {
      p.then((value) => {
        values[i] = value;
        left -= 1;
        if (left === 0) {
          resolve(values.reduce((sum, v) => sum + v, 0));
        }
      }, reject);
    });
  });
}
```

Все промисы стартуют сразу; когда отработают все — складываем. Ошибка любого → `reject` всего результата.
