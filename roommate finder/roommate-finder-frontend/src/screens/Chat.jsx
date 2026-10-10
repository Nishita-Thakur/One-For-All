import { useState } from 'react';

export default function Chat({ connections, people, profile }) {

const connectedPeople = people.filter(person =>
  connections.some(connection => connection.name === person.name)
);

const [selected, setSelected] = useState(connectedPeople[0] || null);


if(!selected){
  return (
    <>
      <header className="app-head compact">
        <div>
          <p className="eyebrow">YOUR CONNECTIONS</p>
          <h1>Chats</h1>
          <p>Only accepted connections can message each other.</p>
        </div>
      </header>

      <section className="feature-match">
        <h2>No chats yet 💬</h2>
        <p>
          Accept a roommate request to start chatting.
        </p>
      </section>
    </>
  );
} const [message, setMessage] = useState(''); return <><header className="app-head compact"><div><p className="eyebrow">YOUR CONNECTIONS</p><h1>Chats</h1><p>Only accepted connections can message each other.</p></div></header><div className="chat-workspace"><div className="chat-list"><b>Messages</b>{connectedPeople.length ? connectedPeople.map(person => <button className={selected.name === person.name ? 'chosen' : ''} key={person.name} onClick={() => setSelected(person)}><div className="avatar" style={{ background: person.color }}>{person.avatar}</div><span><strong>{person.name}</strong><small>Connected roommate match</small></span></button>) : <p>No chats yet.</p>}</div><div className="chat-main"><header><div className="avatar" style={{ background: selected.color }}>{selected.avatar}</div><div><b>{selected.name}</b><small>Connected roommate match</small></div></header><div className="conversation"><div className="date">Today</div><p className="bubble them">Hey {profile.name.split(' ')[0]}! Glad we connected. Want to compare room preferences?</p><p className="bubble me">Absolutely — I’m usually free after 7.</p></div><form className="message" onSubmit={event => { event.preventDefault(); setMessage(''); }}><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Write a message..." /><button>↑</button></form></div></div></>; }
