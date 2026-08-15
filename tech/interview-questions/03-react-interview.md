# Мок-интервью: React (Frontend)

**Уровень:** Middle (универсальный)  
**Язык:** русский  
**Длительность блока:** 45–60 мин  
**Live-coding:** опционально (в конце или вместо части теории)  
**Контекст:** обычно после JS (+ часто TS). На РФ-собесах React — ядро frontend Middle.

---

## Как проводить

### Сценарий
1. Сказать, что блок про React (~45–60 мин), упор на понимание модели рендера и хуков, не на «пересказ доки».
2. Идти по блокам 1→6 — сложность растёт, темы связаны.
3. Уверенный ответ → **follow-up**. Буксует → **упрощение** или следующий блок.
4. Live-coding — если есть время или теория «на словах».
5. В конце 2–3 минуты фидбека.

### Тайминг (ориентир)

| Блок | Тема | Время |
|------|------|-------|
| 1 | База: Virtual DOM, JSX, компоненты | 5–7 мин |
| 2 | Хуки: useState, useEffect, rules, useRef, другие хуки | 10–14 мин |
| 3 | Рендеры, keys, memo / useMemo / useCallback | 8–10 мин |
| 4 | Context, controlled, custom hooks | 7–9 мин |
| 5 | Паттерны: Portal, composition | 5–7 мин |
| 6 | Практика: data fetching, router, state, lazy, perf, tests | 8–12 мин |
| ★ | Live-coding (опционально) | 15–20 мин |

### Как оценивать Middle

| Уровень ответа | Признаки |
|----------------|----------|
| **Сильный** | Объясняет «почему ре-рендер», deps, stale closure, сам приводит кейсы из практики |
| **Средний (норма для Middle)** | Знает хуки и типичные паттерны, путается в тонкостях memo/effect, после подсказки выправляется |
| **Слабый** | Заученные фразы, путает props/state, не понимает массив зависимостей, всё через class без нужды |

**Ожидание Middle:** уверенные блоки 1–3, приемлемый блок 4. Concurrent/Suspense deep dive — плюс, не блокер.

---

# Вопросы с ответами

---

## Блок 1. База React

*Разминка. Без этого нельзя говорить про хуки и оптимизацию.*

### 1. Что такое React? Чем Virtual DOM отличается от реального DOM?

**Зачем спрашивают:** старт почти любого React-скрининга в РФ.

**Эталонный ответ (для ментора):**

React — библиотека для построения UI через **компоненты** и декларативное описание интерфейса: описываем *каким* должен быть UI при данном состоянии, а React обновляет DOM.

**Virtual DOM** — лёгкое JS-представление дерева UI (объекты/fiber-узлы), не настоящие DOM-ноды.

Упрощённый цикл:
1. изменился state/props → React строит новое описание UI;
2. **reconciliation** сравнивает с предыдущим (diff);
3. в реальный DOM уходит **минимальный** набор изменений (commit).

Зачем так:
- работа с реальным DOM дорогая;
- декларативный подход проще, чем вручную мутировать DOM;
- единообразие обновлений.

Нюансы для Middle (не обязательно глубоко):
- современный React использует **Fiber** — перерывной алгоритм согласования;
- «Virtual DOM всегда быстрее jQuery» — миф; выигрыш в модели разработки и батчинге обновлений, а не в магии скорости на любой задаче;
- с React 18+ есть concurrent-возможности (прерывание работы, приоритеты).

**Хороший ответ кандидата:** декларативность, VDOM как представление, diff → patch в реальный DOM.

**Красные флаги:**
- «Virtual DOM — это копия браузера в памяти, которая всегда быстрее».
- Не может связать VDOM с обновлением state.

**Follow-up:** Что такое reconciliation?  
→ Согласование предыдущего и нового дерева, решение что обновить/создать/удалить.

**Упрощение:** «Кто обновляет DOM при `setState` — ты руками или React?»

---

### 2. Что такое JSX? Как он превращается в то, что понимает браузер?

**Эталонный ответ:**

JSX — синтаксический сахар над вызовами `React.createElement` / JSX runtime (`jsx`). Браузер JSX не исполняет — нужен Babel/TypeScript/компилятор.

```jsx
const el = <Button title="Save" />;
// примерно →
const el = React.createElement(Button, { title: "Save" });
```

Особенности:
- `className` вместо `class`, `htmlFor` вместо `for`;
- выражения в `{ }`;
- компонент с большой буквы — иначе React считает HTML-тегом;
- один корень (или фрагмент `<>...</>`).

**Follow-up:** Чем фрагмент лучше лишней `div`?  
→ Не плодит лишние DOM-узлы, не ломает CSS/flex-раскладку.

---

## Блок 2. Хуки: ядро Middle

*Связка с JS: замыкания, event loop — без этого `useEffect` объясняют плохо.*

### 3. Как работает `useState`? Почему нельзя мутировать state напрямую?

**Зачем спрашивают:** база хуков.

**Эталонный ответ:**

```js
const [value, setValue] = useState(initial);
```

- `value` — это **снимок состояния** (state snapshot), который React использует при текущем рендере.
- `setValue` — это сигнал React: «пересчитать UI с новым состоянием». Само состояние не меняется мгновенно в текущем рендере — обновление ставится в очередь.

Почему нельзя мутировать state напрямую:
- мутируя объект/массив внутри `state`, ты часто сохраняешь **ту же ссылку** (reference). React в обновлениях и оптимизациях опирается на сравнение значения и/или ссылок, поэтому «изменения внутри без смены ссылки» могут не привести к ожидаемому re-render;
- даже если где-то UI обновится, вычисления следующего состояния будут опираться на уже мутированное прошлое значение → появляются неожиданные баги.

Нужно создавать **новую** ссылку:

```js
setItems((prev) => [...prev, newItem]);
setUser((prev) => ({ ...prev, name: "Ada" }));
```

Функциональное обновление (functional update) — когда следующее состояние зависит от предыдущего:

```js
setCount((c) => c + 1);
```

Это особенно важно, когда обновлений несколько подряд (React может батчить) или когда update происходит в async-колбэке.

### Lazy initial state

Если `initial` вычисляется «дорого» (или зависит от параметров, которые не должны считаться на каждый рендер), передают функцию:

```js
const [value, setValue] = useState(() => expensiveCompute());
```

Тогда `expensiveCompute()` вызывается **только один раз** — при первом монтировании/инициализации.

### Batching (пакетная обработка)

В React 18 обновления часто батчатся: несколько `setState` подряд внутри одного «чанка»/события приводят к одному re-render.

Типичный пример проблемы без functional update:

```js
setCount(count + 1);
setCount(count + 1);
```

Если React объединит оба вызова, оба обновления могут опираться на один и тот же `count` из замыкания, и итог будет не таким, как ожидаешь.

Правильный вариант:

```js
setCount((c) => c + 1);
setCount((c) => c + 1);
```

Тут каждое обновление берёт актуальное предыдущее значение.

Также в React 18 автоматический batching работает шире (в т.ч. для обновлений из промисов/таймеров).

**Красные флаги:** мутация state; «всё решит `as`/мутирование»; нет понимания functional update при нескольких setState.

**Follow-up:** Что выведет два `setCount(count + 1)` подряд без functional form?

---

### 4. Как работает `useEffect`? Зачем массив зависимостей? Что такое cleanup?

**Зачем спрашивают:** топ-1/топ-2 вопрос по React на Middle.

**Эталонный ответ:**

`useEffect` — побочные эффекты после отрисовки: подписки, fetch, синхронизация с внешним миром.

```js
useEffect(() => {
  const id = setInterval(() => console.log(count), 1000);
  return () => clearInterval(id); // cleanup
}, [count]);
```

Массив зависимостей:
- **нет массива** — эффект после каждого рендера;
- **`[]`** — только mount (+ cleanup на unmount);
- **`[a, b]`** — когда изменились `a` или `b` (сравнение `Object.is`).

Cleanup нужен, чтобы не было утечек: таймеры, listeners, abort fetch, отписка от store.

**Stale closure** — классика:

```js
useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // может «запомнить» старый count, если deps пустой
  }, 1000);
  return () => clearInterval(id);
}, []); // плохо, если читаем count
```

Связь с JS-замыканиями: эффект замыкает значения с рендера, на котором был создан.

Порядок: render → paint → effect. Cleanup предыдущего эффекта — перед следующим effect или при unmount.

`useLayoutEffect` — синхронно после DOM-мутаций, до paint (измерения DOM, избежание мерцания); использовать осознанно.

**Красные флаги:**
- Fetch в effect без abort / игнора устаревшего ответа.
- Пустой deps при использовании props/state внутри.
- «useEffect = componentDidMount» как единственная ментальная модель.

**Follow-up:** Как отменить fetch при размонтировании?  
→ Через `AbortController`: создать контроллер внутри `useEffect`, передать `signal` в `fetch`, а в cleanup вызвать `controller.abort()`. В `catch` отдельно игнорировать `AbortError`, потому что это штатная отмена, а не ошибка UI.

```js
useEffect(() => {
  const controller = new AbortController();

  async function loadUser() {
    try {
      const res = await fetch(`/api/users/${id}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setUser(data);
    } catch (error) {
      if (error.name === "AbortError") return;
      setError(error);
    }
  }

  loadUser();

  return () => {
    controller.abort();
  };
}, [id]);
```

Если библиотека/код не поддерживает `AbortController`, минимальный fallback — `cancelled` флаг в cleanup, чтобы не делать `setState` после размонтирования. Но это уже не настоящая отмена запроса, а только защита от устаревшего ответа.  
**Упрощение:** «Зачем `return () => ...` внутри effect?»

---

### 5. У нас есть `useEffect` с пустым массивом зависимостей, отправляющий запрос на сервер. Но запрос уходит дважды — в чём причина?

**Зачем спрашивают:** очень частый практический вопрос после React 18; ловит понимание Strict Mode и идемпотентных эффектов.

**Эталонный ответ (для ментора):**

Самая частая причина в **development** — `React.StrictMode` (React 18+): React специально делает **mount → unmount → mount** для эффектов, чтобы проверить, что cleanup написан и эффект можно безопасно повторить.

Типичная картина:
1. первый mount → `useEffect` → fetch №1;
2. simulated unmount → должен сработать cleanup (`abort` / `cancelled`);
3. второй mount → `useEffect` снова → fetch №2.

В **production** такого двойного вызова от Strict Mode нет. Если двойной запрос виден и на проде — ищи другие причины.

Другие возможные причины (реже, но полезно знать):
- компонент реально монтируется дважды (ключ/`key` сменился, родитель размонтировал, две копии в дереве);
- React Router / layout ре-mount;
- HMR в dev;
- эффект по факту не с `[]` (зависимость меняется, или забыли deps и effect на каждый рендер — но в формулировке вопроса deps пустой);
- два компонента с одинаковым fetch (например, в списке без мемоизации/дедупа).

Что делать «правильно»:
- не «чинить» Strict Mode отключением без понимания;
- писать cleanup и отмену запроса (`AbortController`);
- для data fetching в проде чаще уходить в **TanStack Query / SWR** (дедуп, кэш), а не сырой fetch в effect;
- понимать: двойной вызов в dev — сигнал проверить идемпотентность, а не баг браузера.

```js
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/items", { signal: controller.signal })
    .then((r) => r.json())
    .then(setItems)
    .catch((e) => {
      if (e.name !== "AbortError") setError(e);
    });

  return () => controller.abort();
}, []);
```

**Хороший ответ кандидата:** «В dev это почти наверняка Strict Mode: эффект монтируют дважды. На проде так не будет. Нужен cleanup/abort; лучше Query.»

**Красные флаги:**
- «это баг React / баг fetch»;
- сразу предлагает убрать `StrictMode` как решение;
- не отличает dev и production.

**Follow-up:** Почему React специально так делает в Strict Mode?  
→ Чтобы рано поймать эффекты без cleanup и побочные эффекты, которые нельзя безопасно повторить.

**Упрощение:** «Где ещё кроме Network можно заметить, что компонент смонтировали дважды в dev?»

### 6. Какие есть правила хуков (Rules of Hooks)? Почему так?

**Эталонный ответ:**

1. Вызывать хуки **только на верхнем уровне** — не в циклах, условиях, вложенных функциях.
2. Вызывать хуки **только из React-функций** (компоненты или custom hooks).

Почему: React связывает хуки с компонентом **по порядку вызовов**. Условие `if (x) useState()` ломает порядок между рендерами → баги state/effect.

```js
// плохо
if (flag) {
  const [v, setV] = useState(0);
}

// ок — условие внутри хука/эффекта, не над вызовом
const [v, setV] = useState(0);
useEffect(() => {
  if (flag) doSomething();
}, [flag]);
```

Имена custom hooks — с `use…`, чтобы линтер (`eslint-plugin-react-hooks`) мог проверять.

**Follow-up:** Что делает eslint-правило `exhaustive-deps`?

---

### 7. Для чего `useRef`? Чем отличается от `useState`?

**Эталонный ответ:**

`useRef(initial)` возвращает объект `{ current: ... }`, который:
- **сохраняется** между рендерами;
- изменение `current` **не вызывает** ре-рендер.

Кейсы:
1. ссылка на DOM-элемент (`inputRef.current.focus()`);
2. хранение мутабельного значения: предыдущий props, id таймера, флаг «mounted»;
3. обход stale closure (держать актуальный колбэк в ref) — продвинутый паттерн.

```js
const inputRef = useRef(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);

const countRef = useRef(0);
countRef.current += 1; // ре-рендера нет
```

vs `useState`: state нужен, когда изменение должно **отразиться в UI**.

**Follow-up:** Как хранить previous value через `useRef` + `useEffect`?

---

### 8. Какими хуками пользуешься? Какие знаешь кроме `useState`, `useEffect`, `useRef`?

**Зачем спрашивают:** быстрая проверка ширины практики; отделяет «знаю три базовых» от уверенного Middle.

**Эталонный ответ (для ментора):**

Ожидают не энциклопедию, а **2–5 хуков с кейсами**, зачем каждый.

Часто используют на практике:

| Хук | Зачем |
|-----|--------|
| `useContext` | читать Context без prop drilling (theme, auth, locale) |
| `useMemo` | кэшировать тяжёлое вычисление между рендерами |
| `useCallback` | стабильная ссылка на колбэк (для `memo`-детей / deps эффектов) |
| `useReducer` | сложный state / много связанных обновлений / state-машина |
| `useLayoutEffect` | синхронно после DOM-мутаций, до paint (измерения, избежать мерцания) |
| `useId` | стабильные уникальные id для a11y (`htmlFor` / `aria-*`) |

Плюсом для Middle+ (знать хотя бы на уровне идеи):
- `useTransition` — пометить обновление как несрочное (тяжёлый UI не блокирует ввод);
- `useDeferredValue` — отложенная версия значения для «дорогих» списков/фильтров;
- `useImperativeHandle` — ограничить API, которое родитель видит через `ref`;
- `useSyncExternalStore` — подписка на внешний store (часто внутри библиотек).

И отдельно: **свои custom hooks** (`useDebounce`, `useLocalStorage`, `useMediaQuery`) — это тоже «хуки, которыми пользуюсь».

```js
const theme = useContext(ThemeContext);
const sorted = useMemo(() => items.slice().sort(cmp), [items]);
const onSave = useCallback(() => save(id), [id]);
const [state, dispatch] = useReducer(reducer, initial);
```

Хорошая стратегия ответа на собесе:
1. перечислить 4–6 штук;
2. на 1–2 дать короткий кейс из опыта;
3. честно сказать, чем пользуешься редко (`useImperativeHandle` и т.п.).

**Красные флаги:**
- только названия без «зачем»;
- путает `useMemo` и `useEffect`;
- «мемоизирую всё через useMemo/useCallback».

**Follow-up:** Чем `useLayoutEffect` отличается от `useEffect`? Когда брать `useReducer` вместо нескольких `useState`?

**Упрощение:** «Какой хук возьмёшь, чтобы прочитать тему из Context?»

## Блок 3. Рендеры, списки, мемоизация

*Логическое продолжение: уже умеем state/effect — когда и зачем оптимизировать.*

### 9. Когда компонент ре-рендерится? Что такое reconciliation на практике?

**Эталонный ответ:**

Ре-рендер (пересчёт функции компонента) обычно когда:
1. изменился **собственный state**;
2. изменились **props** от родителя (родитель ре-рендерился и передал props — даже те же по значению, но см. memo);
3. изменился **context**, на который подписан;
4. принудительно (редко) — устаревшие паттерны forceUpdate.

Важно: ре-рендер ≠ обязательная перерисовка всего DOM. React может решить, что DOM обновлять не нужно.

Родитель ре-рендерится → по умолчанию ре-рендерятся и дети (если не `memo` / не вынесены).

```jsx
function Parent() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(n + 1)}>{n}</button>
      <Child /> {/* тоже ре-рендернется при клике */}
    </>
  );
}
```

**Красные флаги:** «ре-рендер = полная перерисовка страницы».

**Follow-up:** Как избежать лишнего ре-рендера ребёнка?

---

### 10. Зачем `key` в списках? Что будет с плохим `key`?

**Зачем спрашивают:** очень частый вопрос; ловит баги controlled inputs в списках.

**Эталонный ответ:**

`key` помогает reconciliation понять, **какой элемент какой** между рендерами: переместили, удалили, добавили.

Правила:
- key стабильный и уникальный среди соседей;
- лучше **id из данных**, не индекс (индекс плох при insert/delete/sort);
- не использовать случайный `Math.random()` на каждый рендер.

Плохой key → неправильное переиспользование DOM/state: «поехал» текст инпута, лишние mount/unmount, баги анимаций.

```jsx
{users.map((u) => (
  <UserRow key={u.id} user={u} />
))}
```

**Follow-up:** Когда index как key ещё допустим?  
→ Статический список без переупорядочивания и без state внутри элементов.

---

### 11. Чем отличаются `React.memo`, `useMemo` и `useCallback`? Когда применять?

**Зачем спрашивают:** классика Middle; много путаницы.

**Эталонный ответ:**

| API | Что мемоизирует |
|-----|-----------------|
| `React.memo(Component)` | пропускает ре-рендер компонента, если props поверхностно те же |
| `useMemo(() => value, deps)` | мемоизирует **значение** (результат вычисления) |
| `useCallback(fn, deps)` | мемоизирует **ссылку на функцию** (синтаксический сахар над `useMemo(() => fn, deps)`) |

```jsx
const Child = memo(function Child({ onSave }) {
  return <button onClick={onSave}>Save</button>;
});

function Parent({ items }) {
  const total = useMemo(() => items.reduce((a, b) => a + b, 0), [items]);
  const onSave = useCallback(() => save(total), [total]);
  return <Child onSave={onSave} />;
}
```

Когда нужно:
- дорогие вычисления (`useMemo`);
- передаёте колбэк/объект в `memo`-ребёнка или в deps эффекта (`useCallback` / `useMemo`);
- не «на каждый чих» — сначала измерить, преждевременная мемоизация усложняет код.

Ловушка: `memo` бесполезен, если каждый рендер передаёте **новый** объект/функцию inline без мемоизации.

**Красные флаги:** «useMemo ускоряет всё»; путает memo и useMemo; оборачивает всё подряд.

**Follow-up:** Почему `onClick={() => ...}` ломает пользу от `memo` у ребёнка?

**Упрощение:** «Как кэшировать тяжёлый filter списка между рендерами?»

---

## Блок 4. Context, формы данных, custom hooks

### 12. Что такое Context? Какие проблемы и когда не стоит использовать?

**Эталонный ответ:**

Context — способ передать данные дереву **без prop drilling**.

```jsx
const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Page />
    </ThemeContext.Provider>
  );
}

function Button() {
  const { theme } = useContext(ThemeContext);
  return <button className={theme}>OK</button>;
}
```

Минусы:
- при изменении `value` ре-рендерятся **все** потребители;
- легко сделать value новым объектом каждый рендер → лишние ре-рендеры;
- не замена полноценному state manager для частых/сложных обновлений.

Паттерны смягчения: разделить контексты (state / dispatch), мемоизировать value, селекторы (внешние библиотеки), composition.

Когда ок: тема, локаль, auth user (редко меняется), DI конфигурации.

**Follow-up:** Как мемоизировать `value` провайдера?

---

### 13. Controlled vs uncontrolled компоненты. Что выбрать для форм?

**Эталонный ответ:**

**Controlled** — source of truth в React state:

```jsx
const [email, setEmail] = useState("");
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

Плюсы: валидация на лету, disable submit, единый источник.  
Минусы: больше ре-рендеров/кода на каждое поле (на больших формах — библиотеки: React Hook Form и т.д.).

**Uncontrolled** — source of truth в DOM:

```jsx
const ref = useRef();
<input defaultValue="a@" ref={ref} />
// прочитать ref.current.value при submit
```

Плюсы: просто для простых форм/файлов.  
Минусы: сложнее синхронизировать UI-логику.

На практике Middle: controlled по умолчанию; файлы часто uncontrolled; большие формы — RHF/Formik.

**Follow-up:** Почему file input сложно сделать fully controlled?

---

### 14. Что такое custom hook? Зачем нужен?

**Эталонный ответ:**

Custom hook — функция с `use…`, которая вызывает другие хуки и **выносит переиспользуемую логику** состояния/эффектов из компонентов.

```js
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle];
}

function useUser(id) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/users/${id}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setUser)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e);
      });
    return () => ctrl.abort();
  }, [id]);

  return { user, error };
}
```

Это не создаёт «своё дерево в Context» само по себе — каждый вызов хука = **своё** состояние в том компоненте, где вызвали.

**Красные флаги:** думает, что custom hook разделяет state между компонентами как синглтон.

**Follow-up:** Чем custom hook отличается от обычной утилиты `formatDate`?

---

### 15. Что такое Portal? Зачем нужен?

**Эталонный ответ:**

`createPortal(child, domNode)` рендерит children в **другой DOM-узел**, сохраняя React-дерево (context, events bubbling в React-дереве).

Кейсы: модалки, тултипы, дропдауны — чтобы уйти от `overflow: hidden` / z-index родителя.

```jsx
return createPortal(<Modal />, document.getElementById("modal-root"));
```

**Follow-up:** Всплытие событий идёт по DOM или по React-дереву?  
→ В React 17+ делегирование на root; важно понимать, что portal не «ломает» логическое дерево React полностью.

---

### 16. Что такое composition в React? Children, render props (кратко)

**Эталонный ответ:**

Предпочтительный способ переиспользования UI — **композиция**, а не глубокое наследование компонентов.

```jsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

<Modal footer={<Button>OK</Button>}>
  <Form />
</Modal>
```

**render props** / `children` as function — паттерн «компонент просит функцию отрисовки», сегодня чаще заменён хуками, но встречается в интервью и legacy.

HOC (`withAuth(Component)`) — тоже legacy-ish; современные аналоги — хуки / wrappers через composition.

**Follow-up:** Почему `children` гибче, чем десяток boolean-пропсов (`showHeader`, `showFooter`)?

---

## Блок 6. Практика продакшена (обзорно)

*Короткие вопросы «добивкой» — как на реальных собесах в РФ.*

### 17. Как обычно загружают данные в React? Проблемы useEffect-fetch?

**Эталонный ответ:**

Классика: `useEffect` + `fetch`/`axios` + local state (`loading/error/data`).

Проблемы:
- race conditions при быстром смене id;
- нет кэша/дедупликации;
- много boilerplate;
- Strict Mode (dev) двойной mount → двойной fetch.

Современный Middle+ ответ: **React Query / TanStack Query**, SWR, RTK Query; в новых подходах — также Server Components / loaders (Next.js), но на чистом CSR-собесе ждут понимание effect-fetch и его минусов.

```js
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchUser(id).then((u) => {
    if (!cancelled) setUser(u);
  });
  return () => {
    cancelled = true;
  };
}, [id]);
```

**Follow-up:** Чем TanStack Query лучше ручного effect?

---

### 18. Зачем React Router? Что такое nested routes / outlet (на уровне идеи)?

**Эталонный ответ:**

SPA-роутинг без полной перезагрузки страницы: URL ↔ UI.

Базовые понятия:
- `BrowserRouter` / `createBrowserRouter`;
- `Route`, `Link` / `NavLink`;
- `useParams`, `useNavigate`, `useSearchParams`;
- nested routes — layout-родитель + `<Outlet />` для дочерних экранов;
- loaders/actions (data APIs) — в новых версиях RR.

На Middle достаточно уверенно объяснить клиентский роутинг и params.

---

### 19. Context vs Redux/Zustand/MobX — когда что?

**Эталонный ответ:**

| Инструмент | Когда |
|------------|--------|
| Local state | UI одного компонента/небольшой формы |
| Lifting state / composition | соседние компоненты |
| Context | редкие глобальные данные (theme, locale) |
| Zustand / Jotai / Redux Toolkit | сложный клиентский стейт, частые обновления, middleware, devtools |
| Server state (Query) | данные с сервера (кэш, sync) |

Красный флаг: «всё в Redux» или «всё в Context».  
Сильный Middle разделяет **server state** и **client state**.

**Follow-up:** Почему Redux «из коробки» не решает кэширование серверных данных так же, как React Query?

---

### 20. Что такое `React.lazy` и code splitting? Зачем `Suspense`?

**Зачем спрашивают:** частая «продакшен»-тема: уменьшить initial bundle.

**Эталонный ответ:**

**Code splitting** — разбиение бандла на части, которые грузятся по необходимости (маршрут, тяжёлый виджет), а не всё сразу при старте.

```jsx
const AdminPage = React.lazy(() => import("./AdminPage"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminPage />
    </Suspense>
  );
}
```

- `React.lazy` — динамический `import()` компонента;
- `Suspense` — показывает `fallback`, пока lazy-чанк грузится;
- типично режут по **роутам** (`React.lazy` + Router) или тяжёлым модалкам/редакторам.

Нюансы:
- default export у lazy-модуля (или `.then(m => ({ default: m.Named }))`);
- ошибки загрузки чанка → Error Boundary рядом с Suspense;
- в SSR/`Next` механика другая (свои правила dynamic import).

**Follow-up:** Что ещё кладут в Suspense кроме lazy?  
→ В современном React — data fetching / streaming (часто в рамках RSC/фреймворков); на классическом CSR-собесе достаточно lazy + fallback.

**Упрощение:** «Как не тащить админку в бандл обычного пользователя?»

---

### 21. Как ещё оптимизировать React-приложение кроме `memo` / `useMemo`?

**Эталонный ответ:**

Мемоизация — не первый и не единственный рычаг.

Практика продакшена:
1. **меньше работы в принципе** — не хранить выводимое в state, нормализовать данные, виртуализация длинных списков (`react-window` / `virtuoso`);
2. **code splitting** — lazy по роутам;
3. **ключи и структура** — правильные `key`, не размонтировать лишний раз;
4. **базовые web-perf** — картинки (size/format/lazy), шрифты, критический CSS, HTTP-кэш;
5. **измерить** — React Profiler, Lighthouse, bundle analyzer; оптимизировать по факту, не «на глаз»;
6. **server state** — кэш Query вместо лишних refetch и локального дублирования;
7. **debounce/throttle** частых хендлеров (input, scroll).

Сильный ответ: «сначала найти bottleneck, потом точечно memo/виртуализация/split».

**Красные флаги:** `memo` на каждый компонент «на всякий случай».

**Follow-up:** Когда виртуализация списка обязательна?  
→ Тысячи+ строк в DOM без пагинации/windowing.

---

### 22. Как тестируешь React-компоненты? Что такое Testing Library?

**Эталонный ответ:**

Современный стандарт — **React Testing Library (RTL)** + Jest/Vitest: тестируем поведение с точки зрения пользователя, а не внутренности реализации.

Принципы RTL:
- искать по роли/тексту (`getByRole`, `getByText`), не по class/id;
- `userEvent` для кликов/ввода;
- не тестировать state напрямую и не snapshot-ить всё подряд без нужды.

Уровни:
- **unit** — хук/утилита/компонент;
- **integration** — форма + валидация + мок API;
- **e2e** — Playwright/Cypress на критичные сценарии.

```jsx
render(<LoginForm onSubmit={onSubmit} />);
await userEvent.type(screen.getByLabelText(/email/i), "a@b.c");
await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
expect(onSubmit).toHaveBeenCalled();
```

**Красные флаги:** только enzyme/shallow «как раньше»; тесты на количество `div`.

**Follow-up:** Чем RTL лучше тестов через `instance.state`?

---

### 23. Как обычно делают auth и protected routes в SPA?

**Эталонный ответ (на уровне идеи):**

1. логин → access token (часто + refresh) / cookie session;
2. хранение: httpOnly cookie предпочтительнее для XSS-устойчивости; `localStorage` проще, но уязвимее к XSS;
3. `AuthProvider` / store держит `user` + `status`;
4. **ProtectedRoute** / loader: если нет сессии → redirect на `/login`;
5. API-клиент добавляет credentials / Authorization; на 401 — refresh или logout.

```jsx
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

На Middle ждут понимание потока, а не идеальную OAuth-схему. Отдельно полезно упомянуть CSRF при cookie-сессиях.

**Follow-up:** Почему token в `localStorage` считают рискованным?

---

### 24. Что такое optimistic update? Где применяют?

**Эталонный ответ:**

**Optimistic UI** — сразу обновляем интерфейс, как будто запрос уже успешен, а с сервером синхронизируемся в фоне. При ошибке — rollback.

Кейсы: лайк, toggle «прочитано», drag-and-drop порядка, быстрый редактор полей.

```text
UI: like → +1 сразу
API: POST /like
  ok  → оставить
  fail → вернуть -1 + toast
```

В TanStack Query это `onMutate` / `onError` / `onSettled` + кэш. Без библиотеки — локальный state + аккуратный rollback.

Риски: сложные конфликты, гонки, временная рассинхронизация. Не для критичных денег/прав без подтверждения сервера.

**Follow-up:** Чем optimistic отличается от «просто disabled кнопки на время запроса»?

---

### 25. Как дебажишь проблемы в React-приложении на проде/на стейдже?

**Зачем спрашивают:** отделяет тех, кто «чинит наугад», от тех, у кого есть рабочий процесс диагностики.

**Эталонный ответ (для ментора):**

Сильный ответ — не список инструментов, а **пайплайн**:
симптом → воспроизведение → сужение зоны → гипотеза → проверка → фикс → защита от регрессии.

#### 1) Сначала классифицируй симптом

Типичные классы проблем:
- **UI/логика** — «кнопка не работает», «форма в странном состоянии»;
- **данные/API** — пустой экран, вечный loading, старые данные, 401/500;
- **производительность** — лаги, долгий ввод, тяжёлый список;
- **ошибки runtime** — белый экран, uncaught exception;
- **окружение** — только на проде / только у части пользователей / только в Safari.

Без классификации легко час копать Profiler, когда проблема в токене или CORS.

#### 2) Воспроизведи минимально

- на стейдже с теми же feature flags / ролью / данными;
- зафиксируй шаги, URL, user-agent, время;
- по возможности сделай **минимальный кейс** (убрать лишние шаги);
- сравни prod vs stage vs local: отличается ли API, конфиг, кэш, версия билда.

Если не воспроизводится локально — почти всегда расхождение окружения (env, CDN cache, A/B, права, данные).

#### 3) Инструменты по слоям

**React DevTools**
- Components: props/state/context «здесь и сейчас»;
- почему ребёнок получил другие props;
- Profiler: кто ре-рендерился, сколько длился commit, «why did this render» (если доступно).

**Browser DevTools**
- Console — stack trace, source maps;
- Network — статус, payload, timing, повторы, race;
- Performance/Performance monitor — long tasks, layout thrashing;
- Application — cookies, localStorage, service worker cache.

**Прод-наблюдаемость**
- Sentry / Bugsnag / аналог: группировка ошибок, breadcrumb’ы, release/version;
- логи API / tracing (correlation id);
- аналитика/сессии (FullStory и т.п.) — осторожно с PII.

**Защита UI**
- Error Boundary → fallback вместо белого экрана + отправка ошибки в мониторинг.

#### 4) Частые React-сценарии и куда смотреть

| Симптом | Куда копать |
|---------|-------------|
| Белый экран после действия | stack + Error Boundary; ошибка в render |
| «Застыл» loading | Network + состояние запроса; нет обработки error/empty |
| Показывают старые данные | кэш Query/CDN; race (старый ответ позже нового); deps effect |
| Лагает ввод/скролл | Profiler + виртуализация; лишние ре-рендеры; тяжёлый render |
| Работает локально, ломается на проде | env/API URL, CORS, auth cookie, HTTPS mixed content, старый бандл без invalidate |
| Баг «иногда» | гонки, StrictMode только в dev (не путать с продом), concurrent user actions |

#### 5) Прод vs стейдж: отличия, о которых забывают

- другой backend / feature flags / процент rollout;
- минифицированный бандл → нужны **source maps** (хотя бы для staging/internal);
- кэш CDN/Service Worker отдаёт старую версию;
- меньше данных / другие права роли;
- privacy: на проде нельзя светить PII в логах.

#### 6) После фикса

- регрессионный тест (unit/RTL или e2e на критичный путь);
- проверка метрик/ошибок в Sentry после релиза;
- при риске — feature flag / canary.

**Хороший ответ кандидата (1–2 мин):**
«Сначала воспроизвожу и классифицирую. Для UI/рендеров — React DevTools + Profiler. Для данных — Network и состояние запроса. Для прод-ошибок — Sentry + release. Потом минимальный фикс и тест/флаг.»

**Красные флаги:**
- «просто console.log везде»;
- не отличает perf-баг от data-бага;
- не знает, зачем source maps / Error Boundary на проде.

**Follow-up:** Как понять, какой компонент лишний раз рендерится?  
→ React Profiler / why-did-you-render в dev; смотреть, меняется ли reference props/context.

**Follow-up 2:** Что сделаешь, если ошибка только у 5% пользователей?  
→ сегментация в Sentry (browser/version/role), feature flag, проверка эксперимента/кэша.

**Упрощение:** «С чего начнёшь, если на проде белый экран после клика?»

---

# Live-coding (опционально)

*Включай при 15+ минутах или слабой теории.*

---

## Задача A (базовая): счётчик / список

**Условие:** Компонент Todo: добавить пункт, список, удаление. State на `useState`, корректные `key`.

**На что смотреть:** иммутабельные обновления массива, key=id, отсутствие мутаций.

---

## Задача B (средняя): fetch + useEffect

**Условие:** По `userId` загружать пользователя. Показать loading/error/data. Учесть размонтирование / смену id (abort или flag).

**Эталонная идея:** `AbortController` или `cancelled` флаг в cleanup; deps `[userId]`.

**Связь:** блок 2 и 6.

---

## Задача C (средняя): debounce поиска

**Условие:** Инпут поиска; запрос не чаще, чем после паузы 300ms (или свой debounce).

**На что смотреть:** debounce + effect / использование готового хука; cleanup таймера.

**Связь:** JS debounce + React effect.

---

## Задача D (средняя+): custom hook `useLocalStorage`

```js
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

**Follow-up:** Синхронизация между вкладками (`storage` event).

---

## Задача E (harder): memo / лишние рендеры

Родитель со счётчиком + тяжёлый ребёнок. Сделать так, чтобы клик по счётчику не перерендеривал ребёнка (`memo` + стабильные props).

---

# Шпаргалка ментора: порядок «на одном дыхании»

1. Virtual DOM / declarative UI  
2. `useState` (иммутабельность)  
3. `useEffect` + deps + cleanup (+ stale closure)  
4. Rules of Hooks  
5. `key` в списках  
6. `memo` / `useMemo` / `useCallback`  
7. Context (когда не надо)  
8. Controlled inputs  
9. Query vs effect / server vs client state  
10. lazy + Suspense (если время)  
11. ★ Live-coding: B или C  

Сильный → Portal, Query, Zustand/Redux, lazy, RTL на уровне выбора.  
Слабый → не мучай concurrent/SSR deep dive; разберите effect на задаче B.

---

# Мини-чеклист оценки

- [ ] Virtual DOM / reconciliation (базово)  
- [ ] useState + иммутабельность  
- [ ] useEffect / deps / cleanup  
- [ ] Rules of Hooks  
- [ ] keys  
- [ ] memo / useMemo / useCallback  
- [ ] Context  
- [ ] Controlled / uncontrolled  
- [ ] Custom hooks  
- [ ] Data fetching / Query  
- [ ] Router (базово)  
- [ ] lazy / code splitting  
- [ ] Live-coding (если был)

**Вердикт Middle:**
- **уверенный Middle** — effect/deps/stale closure + keys + когда memo; задачу B решает; понимает server vs client state;
- **слабый Middle** — путает deps, мутирует state, memo «на всё»;
- **сильный Middle+** — сам говорит про race fetch, Query, lazy/code splitting, composition, базовый подход к тестам.

---

# Связки с соседними блоками

**После JS:**  
«Замыкания и event loop → stale closure в `useEffect` и порядок paint/effect».

**После TS:**  
типизация props, `useState<T>`, events, generic-списки.

**Дальше по серии (опционально):** Next.js / performance / testing (`04-...`).

---

*Конец гайда по React.*
