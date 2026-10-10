export default function RequestPanel({ requests, people, close, accept }) { return <div className="inbox-overlay"><section className="inbox"><header><div><p className="eyebrow">CONNECTION REQUESTS</p><h2>Notifications</h2></div><button className="close" onClick={close}>×</button></header>{requests.length ? requests.map(request => {

 const person = people.find(
   item => item.name === request.name
 ); return <article className="request" key={request.name}><div className="avatar" style={{ background: person.color }}>{person.avatar}</div><div><h3>{person.name}</h3><p>{person.compatibility || 'A strong'} compatibility match.</p><small>
  Sent {request.date}
</small></div><div><button className="accept" onClick={() => accept(request.name)}>Accept</button><button className="decline" onClick={close}>Ignore</button></div></article>; }) : <div className="empty"><div>✦</div><h3>All caught up</h3><p>New requests will appear here.</p></div>}</section></div>; }
