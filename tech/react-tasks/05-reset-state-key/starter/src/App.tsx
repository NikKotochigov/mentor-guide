import { useState } from "react";
import { Chat } from "./Chat";
import { CONTACTS } from "./data";

export default function App() {
  const [contactId, setContactId] = useState(CONTACTS[0].id);
  const contact = CONTACTS.find((c) => c.id === contactId)!;

  return (
    <>
      <nav>
        {CONTACTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setContactId(c.id)}
            disabled={c.id === contactId}
          >
            {c.name}
          </button>
        ))}
      </nav>
      {/* TODO: при смене контакта в поле остаётся черновик прошлого собеседника.
          Коллега предлагает useEffect, который сбрасывает draft при смене contact.id.
          Сделай проще и без лишнего рендера. */}
      <Chat contact={contact} />
    </>
  );
}
