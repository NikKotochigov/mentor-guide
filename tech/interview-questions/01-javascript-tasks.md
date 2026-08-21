# JavaScript: задачи

Условие и решение — кодом.

---

## 1. `this`: arrow vs function

```js
const myCat = {
  sound: "meow",
  say: () => console.log("say:", this?.sound),
  say2: function () {
    console.log("say2:", this.sound);
  },
};

// myCat.say();
// myCat.say2();

const { say, say2 } = myCat;

// say();
// say2();

class Cat {
  sound = "meow";

  say = () => console.log("Cat.say:", this.sound);

  say2() {
    console.log("Cat.say2:", this.sound);
  }
}

const myCat2 = new Cat();

// myCat2.say();
// myCat2.say2();

const { say: sayFromInstance, say2: say2FromInstance } = myCat2;

// sayFromInstance();
// say2FromInstance();
```

```js
// Решение
// Arrow НЕ имеет своего this — берёт из внешней области.
// Обычная function: this от способа вызова (obj.method() => this === obj).

const myCat = {
  sound: "meow",
  say: () => console.log("say:", this?.sound),
  say2: function () {
    console.log("say2:", this.sound);
  },
};

myCat.say(); // say: undefined
myCat.say2(); // say2: meow

const { say, say2 } = myCat;

say(); // undefined (или window/global) — у arrow this лексический
say2(); // TypeError в strict (this = undefined) / undefined в non-strict

class Cat {
  sound = "meow";

  // arrow-поле экземпляра захватывает this экземпляра
  say = () => console.log("Cat.say:", this.sound);

  // обычный метод — this зависит от вызова
  say2() {
    console.log("Cat.say2:", this.sound);
  }
}

const myCat2 = new Cat();

myCat2.say(); // Cat.say: meow
myCat2.say2(); // Cat.say2: meow

const { say: sayFromInstance, say2: say2FromInstance } = myCat2;

sayFromInstance(); // Cat.say: meow
say2FromInstance(); // TypeError в strict (this = undefined) / undefined в non-strict
```

---

## 2. Promise chain: then / catch / finally

```js
const run = () =>
  Promise.resolve(1)
    .then((x) => x + 1)
    .then((x) => {
      throw x;
    })
    .then((x) => console.log(x))
    .catch((err) => {
      console.log(err);
      return 10;
    })
    .finally((res) => console.log(res))
    .then((x) => Promise.resolve(1))
    .catch((err) => console.log(err))
    .then((x) => console.log(x));

// run();
```

```js
// Решение
// В консоль: 2 → undefined → 1
//
// 1) Promise.resolve(1)          → fulfilled(1)
// 2) .then(x => x + 1)           → fulfilled(2)
// 3) .then(x => { throw x })     → rejected(2)  — throw / return rejected промиса
// 4) .then(x => console.log(x))  → ПРОПУСК: after rejection вызываются только catch/onRejected
// 5) .catch(err => { log(err); return 10 })
//      → console: 2
//      → return из catch снова делает звено fulfilled(10)
// 6) .finally(cb)
//      → finally ВСЕГДА вызывается (и после fulfill, и после reject)
//      → колбэк finally НЕ получает значение промиса (аргумент = undefined)
//      → console: undefined
//      → наружу finally пропускает предыдущий результат: всё ещё fulfilled(10)
//        (если бы finally бросил ошибку / вернул rejected — перебил бы цепочку)
// 7) .then(x => Promise.resolve(1))
//      → x === 10
//      → вернули промис → «разворачивается» до fulfilled(1)
// 8) .catch(...)                 → ПРОПУСК: ошибки нет
// 9) .then(x => console.log(x))  → console: 1

const run = () =>
  Promise.resolve(1)
    .then((x) => x + 1) // 2
    .then((x) => {
      throw x;
    }) // rejection(2)
    .then((x) => console.log(x)) // skip
    .catch((err) => {
      console.log(err); // 2
      return 10; // снова fulfilled(10)
    })
    .finally((res) => console.log(res)) // res === undefined; значение 10 сохраняется
    .then((x) => Promise.resolve(1)) // x === 10 → дальше 1
    .catch((err) => console.log(err)) // skip
    .then((x) => console.log(x)); // 1

run();
```

---

## 3. `reduce` — своя реализация

```js
/*
Реализовать reduce(arr, callback, initialValue?).

Поведение как у Array.prototype.reduce:
- с initialValue — acc стартует с него, обход с 0
- без initialValue — acc = arr[0], обход с 1

callback(acc, item, index, arr)
*/

function reduce(arr, callback, initialValue) {
  // TODO
}

// reduce([1, 2, 3, 4], (acc, n) => acc + n, 0)  → 10
// reduce([1, 2, 3, 4], (acc, n) => acc * n)     → 24
```

```js
// Решение
// arguments.length — отличить «initialValue не передали» от «передали undefined».

function reduce(arr, callback, initialValue) {
  const hasInitial = arguments.length >= 3;

  let acc = hasInitial ? initialValue : arr[0];
  let start = hasInitial ? 0 : 1;

  for (let i = start; i < arr.length; i++) {
    acc = callback(acc, arr[i], i, arr);
  }

  return acc;
}

reduce([1, 2, 3, 4], (acc, n) => acc + n, 0); // 10
reduce([1, 2, 3, 4], (acc, n) => acc * n); // 24 (acc = arr[0])
```
