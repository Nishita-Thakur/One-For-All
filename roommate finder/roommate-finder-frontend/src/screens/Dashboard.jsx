import PersonCard from '../components/PersonCard';

export default function Dashboard({ profile, matches, requests, openRequests, openPerson, sendRequest, sentRequests, setScreen }) {

const top = matches[0];

if(!top){
  return (
    <>
      <header className="app-head">
        <div>
          <p className="eyebrow">
            GOOD AFTERNOON, {(profile.name ?? "").split(" ")[0]?.toUpperCase()}
          </p>
          <h1>People you’ll get along with.</h1>
          <p>
            Your roommate matches will appear here once profiles are available.
          </p>
        </div>
      </header>

      <section className="feature-match">
        <h2>No matches found yet 🚀</h2>
        <p>
          Complete profiles from other students will appear here.
        </p>
      </section>
    </>
  );
} return <><header className="app-head"><div><p className="eyebrow">GOOD AFTERNOON, {profile.name.split(' ')[0].toUpperCase()}</p><h1>People you’ll get along with.</h1><p>Your compatibility updates every time you update your preferences.</p></div><button className="bell" onClick={openRequests}>♢{requests.length > 0 && <i />}</button></header><section className="feature-match"><div><p className="eyebrow">TOP MATCH FOR YOU</p><h2>{top.name} <span>{top.compatibility}% compatible</span></h2><p>Shared routines, room habits, and interests make this an especially strong fit.</p><div className="chips">{top.preferences.interests.slice(0, 3).map(item => <em key={item}>{item}</em>)}</div><button onClick={() => openPerson(top.candidate_id)}>View full profile →</button></div><div className="feature-art"><div className="avatar huge" style={{ background: top.color }}>{top.avatar}</div><div className="quote">“{top.bio}”</div></div></section><section className="section-head"><div><h2>Great fits</h2><p>Matches from your current preferences.</p></div><button className="text-button" onClick={() => setScreen('find')}>See all →</button></section><div className="card-grid">{matches.slice(1, 4).map(person => <PersonCard key={person.name} person={person} openPerson={openPerson} sendRequest={sendRequest} requestSent={sentRequests.includes(person.name)} />)}</div></>; }
