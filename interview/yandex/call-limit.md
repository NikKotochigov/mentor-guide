# `callLimit` — декоратор с лимитом вызовов

## Условие

Написать декоратор для функции, который ограничивает число её вызовов.

```js
callLimit(fn, limit, callback)
```

- `fn` — декорируемая функция
- `limit` — сколько раз её можно вызвать
- `callback` — (необязательно) вызывается при последнем разрешённом вызове

У обёртки должен быть метод, который сбрасывает счётчик вызовов в начальное состояние.

## Пример

```js
function log(title, message) {
  console.log(`Title: ${title}, message: ${message}`);
}

var logLimited = callLimit(log, 3);

logLimited("title1", "desc"); // Title: title1, message: desc
logLimited("title2", "desc"); // Title: title2, message: desc
logLimited("title3", "desc"); // Title: title3, message: desc
logLimited("title4", "desc"); // ничего

logLimited.reset(); // сбросили счётчик

logLimited("title5", "desc"); // Title: title5, message: desc
logLimited("title6", "desc"); // Title: title6, message: desc
logLimited("title7", "desc"); // Title: title7, message: desc
logLimited("title8", "desc"); // ничего
```

## Решение

```js
function callLimit(fn, limit, callback) {
  let count = 0;

  function limited(...args) {
    if (count >= limit) return;

    count += 1;
    const result = fn.apply(this, args);

    if (count === limit && typeof callback === "function") {
      callback();
    }

    return result;
  }

  limited.reset = function reset() {
    count = 0;
  };

  return limited;
}
```

### Как работает

1. В замыкании хранится `count` — сколько раз уже вызвали.
2. Пока `count < limit` — вызываем `fn` (через `apply`, чтобы сохранить `this` и аргументы).
3. На последнем разрешённом вызове (`count === limit`) опционально зовём `callback`.
4. Дальше обёртка сразу выходит и ничего не делает.
5. `limited.reset` — метод на самой функции-обёртке; обнуляет `count` за счёт того же замыкания.

### С `callback` в примере

```js
const logLimited = callLimit(log, 3, () => {
  console.log("лимит исчерпан");
});

logLimited("a", "1");
logLimited("b", "2");
logLimited("c", "3"); // после этого: «лимит исчерпан»
logLimited("d", "4"); // тишина
```
