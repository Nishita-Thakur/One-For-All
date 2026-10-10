import { useState } from 'react';
import { shortBranch } from '../lib/utils';

export default function Requests({
requests,
sentRequests,
connections,
people,
withdrawRequest,
accept,
setScreen,
openPerson
}) {

const [tab,setTab] = useState("incoming");

const incoming = requests;

const sent = sentRequests;

const accepted = people.filter(person =>
  connections?.some(connection => connection.name === person.name)
);


return (
<section className="requests-page">

<header className="requests-header">
<div>
<p className="eyebrow">CONNECTION CENTER</p>
<h1>Requests</h1>
<p>Manage roommate invitations and connections.</p>
</div>
</header>


<div className="request-tabs">

<button 
className={tab==="incoming"?"active":""}
onClick={()=>setTab("incoming")}
>
Incoming
<span>{incoming.length}</span>
</button>


<button
className={tab==="sent"?"active":""}
onClick={()=>setTab("sent")}
>
Sent
<span>{sent.length}</span>
</button>


<button
className={tab==="accepted"?"active":""}
onClick={()=>setTab("accepted")}
>
Accepted
<span>{accepted.length}</span>
</button>

</div>



<div className="requests-grid">


{tab==="incoming" && incoming.map(person=>(

<div className="request-card-new">

<div className="request-user">

<div 
className="avatar"
style={{background:person.color}}
>
{person.avatar}
</div>


<div>
<h2>{person.name}</h2>
<p>
{person.year} · {shortBranch(person.branch)}
</p>
<p>
⌂ {person.hostel}
</p>
</div>

</div>


<div className="match-pill">
94% Match
</div>


<div className="request-tags">

{(person.preferences?.interests || []).map(item=>(
<span key={item}>{item}</span>
))}

</div>


<p className="request-description">
{person.bio}
</p>


<div className="request-actions-new">

<button
className="view"
onClick={() => openPerson(person.candidate_id)}
>
View Profile
</button>


<button className="reject">
Reject
</button>


<button
className="approve"
onClick={() => accept(person.id, person.name)}
>
Accept
</button>

</div>


</div>

))}



{tab==="sent" && sent.map(person=>(

<div className="request-card-new">

<div className="request-user">

<div
className="avatar"
style={{background:person.color}}
>
{person.avatar}
</div>

<div>
<h2>{person.name}</h2>
<p>
{person.year} · {shortBranch(person.branch)}
</p>
</div>

</div>

<div className="pending-pill">
Pending
</div>

<div className="request-actions-new">

<button
className="view"
onClick={() => openPerson(person.candidate_id)}
>
View Profile
</button>

<button
className="withdraw-new"
onClick={()=>withdrawRequest(person.name)}
>
Withdraw request
</button>

</div>

</div>

))}


</div>

</section>
)

}
