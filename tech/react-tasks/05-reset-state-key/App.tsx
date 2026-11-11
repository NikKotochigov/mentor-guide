/*
  Сброс state через key (30-40 минут)

  Чат с несколькими контактами. Ниже уже есть список и поле черновика,
  но в нём два бага.

  Что сделать:
  1. Поле теряет фокус после каждого введённого символа.
     Найди причину и исправь.
  2. При переключении контакта в поле остаётся черновик прошлого
     собеседника. Коллега предлагает useEffect, который сбрасывает
     draft при смене contact.id. Сделай проще и без лишнего рендера.

  Данные контактов менять не нужно.

  Как проверить:
  - можно набрать несколько символов подряд: курсор остаётся в поле,
    текст не сбрасывается;
  - переключение на другого контакта показывает пустое поле
    и новое имя в подписи;
  - возврат к предыдущему контакту тоже показывает пустое поле,
    а не старый черновик.
*/

import { useState } from "react";

type Contact = { id: string; name: string };

const CONTACTS: Contact[] = [
  { id: "ann", name: "Ann" },
  { id: "bob", name: "Bob" },
  { id: "tom", name: "Tom" },
];

function Chat({ contact }: { contact: Contact }) {
  const [draft, setDraft] = useState("");

  // TODO: поле теряет фокус после каждого символа. Почему? Исправь.
  function Field() {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={`Сообщение для ${contact.name}`}
        rows={4}
        cols={40}
      />
    );
  }

  return (
    <div>
      <p>Чат с {contact.name}</p>
      <Field />
    </div>
  );
}

export function App() {
  const [contactId, setContactId] = useState(CONTACTS[0].id);
  const contact = CONTACTS.find((c) => c.id === contactId)!;

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <nav>
        {CONTACTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setContactId(c.id)}
            disabled={c.id === contactId}
            style={{ marginRight: 8 }}
          >
            {c.name}
          </button>
        ))}
      </nav>
      {/* TODO: при смене контакта в поле остаётся черновик прошлого собеседника.
          Коллега предлагает useEffect, который сбрасывает draft при смене contact.id.
          Сделай проще и без лишнего рендера. */}
      <Chat contact={contact} />
    </div>
  );
}

export default App;
