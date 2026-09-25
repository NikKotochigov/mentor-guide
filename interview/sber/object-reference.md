# Ссылки на объект — что выведет `secondObj.name`

## Условие

```js
let firstObj = { name: "Hello" };
let secondObj = firstObj;
firstObj = { name: "Bye", age: 13 };
console.log(secondObj.name); // ?
```

## Ответ

```text
Hello
```

## Как работает

1. `firstObj` указывает на объект `{ name: "Hello" }`.
2. `secondObj = firstObj` копирует ссылку, не объект. Обе переменные смотрят на один и тот же объект.
3. `firstObj = { name: "Bye", age: 13 }` не меняет старый объект. В `firstObj` записывается ссылка на новый объект.
4. `secondObj` по-прежнему указывает на `{ name: "Hello" }`, поэтому `secondObj.name` — `"Hello"`.

```text
до:   firstObj ──┐
                 ├──► { name: "Hello" }
      secondObj ─┘

после: firstObj ────► { name: "Bye", age: 13 }
       secondObj ───► { name: "Hello" }
```

## Если бы мутировали, а не переприсваивали

```js
let firstObj = { name: "Hello" };
let secondObj = firstObj;
firstObj.name = "Bye";
console.log(secondObj.name); // "Bye"
```

Здесь обе переменные всё ещё смотрят на один объект, поэтому изменение поля видно через `secondObj`.

## Что путают

- Присваивание объекта копирует ссылку, не делает глубокую копию.
- `firstObj = { ... }` — новая ссылка. Старый объект жив, пока на него кто-то указывает.
- `firstObj.name = ...` — мутация того же объекта. Это другой результат.
