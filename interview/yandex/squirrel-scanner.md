# `squirrelScanner` — найти всех белок на дереве

## Условие

Есть дерево, на котором сидят белки и вороны. Нужно написать функцию, которая находит всех белок на дереве и возвращает их имена.

```ts
type Tree = {
  nest: Squirrel | Raven;
  branches?: Tree[];
};

type Squirrel = {
  name: string;
  type: "squirrel";
};

type Raven = {
  name: string;
  type: "raven";
};

function squirrelScanner(tree: Tree): string[] {
  // your code here
}
```

## Пример

```js
const tree = {
  nest: { name: "NEVERMORE!", type: "raven" },
  branches: [
    {
      nest: { name: "Acorn", type: "squirrel" },
      branches: [
        {
          nest: { name: "Sir Salty", type: "squirrel" },
        },
        {
          nest: { name: "Huginn", type: "raven" },
          branches: [
            {
              nest: { name: "Muninn", type: "raven" },
            },
          ],
        },
      ],
    },
  ],
};

squirrelScanner(tree); // ['Acorn', 'Sir Salty']
```

## Решение (рекурсия)

```js
function squirrelScanner(tree) {
  const names = [];

  if (tree.nest.type === "squirrel") {
    names.push(tree.nest.name);
  }

  if (tree.branches) {
    for (const branch of tree.branches) {
      names.push(...squirrelScanner(branch));
    }
  }

  return names;
}
```

### Как работает

1. Смотрим `nest` текущего узла: если `type === 'squirrel'` — кладём `name` в результат.
2. Если есть `branches` — рекурсивно обходим каждую ветку и дописываем найденные имена.
3. Воронов (`raven`) пропускаем.

### Вариант с аккумулятором (без `...` на каждом уровне)

```js
function squirrelScanner(tree, result = []) {
  if (tree.nest.type === "squirrel") {
    result.push(tree.nest.name);
  }

  if (tree.branches) {
    for (const branch of tree.branches) {
      squirrelScanner(branch, result);
    }
  }

  return result;
}
```

Меньше промежуточных массивов — удобнее на глубоком дереве.

### Итеративно (стек / DFS)

```js
function squirrelScanner(tree) {
  const names = [];
  const stack = [tree];

  while (stack.length > 0) {
    const node = stack.pop();

    if (node.nest.type === "squirrel") {
      names.push(node.nest.name);
    }

    if (node.branches) {
      for (const branch of node.branches) {
        stack.push(branch);
      }
    }
  }

  return names;
}
```

Порядок имён может отличаться от рекурсивного DFS слева направо (стек идёт с конца). Если нужен тот же порядок, что в примере:

```js
function squirrelScanner(tree) {
  const names = [];
  const stack = [tree];

  while (stack.length > 0) {
    const node = stack.pop();

    if (node.nest.type === "squirrel") {
      names.push(node.nest.name);
    }

    if (node.branches) {
      for (let i = node.branches.length - 1; i >= 0; i -= 1) {
        stack.push(node.branches[i]);
      }
    }
  }

  return names;
}
```
