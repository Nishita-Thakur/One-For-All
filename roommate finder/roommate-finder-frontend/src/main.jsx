import { supabase } from "./lib/supabase";
window.supabase = supabase;
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';



const BRANCHES = ['Computer Science & Engineering', 'Computer Engineering', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Biotechnology', 'Mathematics & Computing', 'Business Administration', 'Architecture'];
const HOSTELS = { Male: ['Hostel H', 'Hostel J', 'Hostel K', 'Hostel M'], Female: ['Hostel E', 'Hostel G', 'Hostel I', 'Hostel PG1', 'Hostel PG2', 'Hostel Q'] };
const ROOM_TYPES = ['Single', 'Two sharing', 'Three sharing', 'Four sharing'];
const WAKE_TIMES = ['5:30 AM', '6:30 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'];
const defaultPreferences = { roomType: 'Two sharing', roommateYear: 'Any year', food: 'No preference', sleep: 'Flexible', wake: '7:00 AM', clean: 'Balanced', study: 'Balanced', noise: 'Medium', interests: ['Music', 'Reading'] };
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = window.localStorage.getItem('roommate-theme');
  return savedTheme === 'light' ? 'light' : 'dark';
};
const initialTheme = getInitialTheme();
document.documentElement.dataset.theme = initialTheme;
const student = (name, gender, year, branch, hostel, avatar, color, preferences) => ({ name, gender, year, branch, hostel, avatar, color, bio: 'Looking for a kind, respectful person to share a calm and friendly room with.', preferences });
const demoStudents = [
  student('Aarav Sharma', 'Male', '2nd year', 'Computer Engineering', 'Hostel H', 'AS', '#2563EB', { ...defaultPreferences, sleep: 'Early bird', wake: '6:30 AM', clean: 'Very tidy', interests: ['Football', 'Music', 'Reading'] }),
  student('Kabir Mehta', 'Male', '2nd year', 'Computer Science & Engineering', 'Hostel J', 'KM', '#3B82F6', { ...defaultPreferences, sleep: 'Night owl', wake: '8:30 AM', study: 'Quiet focus', interests: ['Gym', 'Movies', 'Music'] }),
  student('Vihaan Gupta', 'Male', '1st year', 'Electronics & Communication', 'Hostel H', 'VG', '#1E293B', { ...defaultPreferences, sleep: 'Flexible', noise: 'High', interests: ['Gaming', 'Music', 'Movies'] }),
  student('Rohan Kapoor', 'Male', '3rd year', 'Mechanical Engineering', 'Hostel K', 'RK', '#0F172A', { ...defaultPreferences, clean: 'Very tidy', study: 'Quiet focus', interests: ['Cricket', 'Reading', 'Travel'] }),
  student('Arjun Malhotra', 'Male', '2nd year', 'Electrical Engineering', 'Hostel M', 'AM', '#4F46E5', { ...defaultPreferences, sleep: 'Night owl', noise: 'High', interests: ['Gaming', 'Gym', 'Movies'] }),
  student('Dev Khanna', 'Male', '1st year', 'Civil Engineering', 'Hostel J', 'DK', '#2563EB', { ...defaultPreferences, clean: 'Relaxed', study: 'Social', interests: ['Travel', 'Cricket', 'Music'] }),
  student('Yash Verma', 'Male', '2nd year', 'Mathematics & Computing', 'Hostel H', 'YV', '#3B82F6', { ...defaultPreferences, sleep: 'Early bird', noise: 'Low', interests: ['Reading', 'Chess', 'Music'] }),
  student('Samar Jain', 'Male', '3rd year', 'Chemical Engineering', 'Hostel K', 'SJ', '#1E293B', { ...defaultPreferences, study: 'Quiet focus', interests: ['Movies', 'Travel', 'Cooking'] }),
  student('Ananya Gupta', 'Female', '2nd year', 'Computer Engineering', 'Hostel E', 'AG', '#0F172A', { ...defaultPreferences, sleep: 'Early bird', wake: '6:30 AM', clean: 'Very tidy', interests: ['Reading', 'Music', 'Cooking'] }),
  student('Ishita Kapoor', 'Female', '2nd year', 'Computer Science & Engineering', 'Hostel G', 'IK', '#4F46E5', { ...defaultPreferences, sleep: 'Night owl', wake: '9:00 AM', interests: ['Movies', 'Music', 'Travel'] }),
  student('Meher Bansal', 'Female', '1st year', 'Electronics & Communication', 'Hostel I', 'MB', '#2563EB', { ...defaultPreferences, noise: 'High', interests: ['Gaming', 'Music', 'Movies'] }),
  student('Kavya Singh', 'Female', '3rd year', 'Mechanical Engineering', 'Hostel PG1', 'KS', '#3B82F6', { ...defaultPreferences, study: 'Quiet focus', interests: ['Cricket', 'Reading', 'Travel'] }),
  student('Naina Arora', 'Female', '2nd year', 'Electrical Engineering', 'Hostel PG2', 'NA', '#1E293B', { ...defaultPreferences, sleep: 'Night owl', noise: 'High', interests: ['Movies', 'Cooking', 'Travel'] }),
  student('Riya Sethi', 'Female', '1st year', 'Biotechnology', 'Hostel Q', 'RS', '#0F172A', { ...defaultPreferences, clean: 'Relaxed', study: 'Social', interests: ['Gaming', 'Music', 'Travel'] }),
];

function getScore(profile, person) {
  const a = profile.preferences, b = person.preferences;
  const checks = [a.sleep === b.sleep, a.clean === b.clean, a.study === b.study, a.noise === b.noise, a.food === b.food, a.roommateYear === 'Any year' || a.roommateYear === person.year];
  const shared = a.interests.filter(item => b.interests.includes(item)).length;
  return Math.min(98, Math.max(62, 64 + checks.filter(Boolean).length * 5 + shared * 4 + (profile.hostel === person.hostel ? 3 : 0)));
}

function App() {
  const [screen, setScreen] = useState('welcome');
  const [authMode, setAuthMode] = useState('signup');
  const [onboardStep, setOnboardStep] = useState(0);
  const [theme, setTheme] = useState(initialTheme);
  const [profile, setProfile] = useState({
 name:'',
 gender:'',
 year:'',
 branch:'',
 hostel:'',
 score:'',
 bio:'',
 preferences: defaultPreferences
});
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

async function loadUserProfile(){
  const {data:{user}} = await supabase.auth.getUser();

  if(!user) return;


  const {data, error} = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();


  if(error){
    console.log("Profile fetch error:", error);
    return;
  }
  console.log("LOADED PROFILE FROM DB:", data);
  setProfile(prev => ({
    ...prev,
    name: data.full_name,
    gender: data.gender?.charAt(0).toUpperCase() + data.gender?.slice(1).toLowerCase(),
    branch: data.branch,
    bio: data.bio
  }));

}

async function fetchMatches(){

  const { data, error } = await supabase
    .rpc("get_roommate_matches");
    console.log("CURRENT USER:", await supabase.auth.getUser());
console.log("MATCH RPC RESULT:", data, error);

console.log(
  data.map(x => ({
    id: x.candidate_id,
    name: x.full_name,
    percentage: x.match_percentage
  }))
);

  if(error){
  console.log("Match error:", JSON.stringify(error, null, 2));
  return;
}

const { data: { user } } = await supabase.auth.getUser();

console.log("LOGGED USER:", user.id);
  console.log(
  data.map(x => ({
    id: x.candidate_id,
    name: x.full_name,
    percentage: x.match_percentage
  }))
);

  setStudents(data);

}

async function fetchSentRequests(){

  const { data:{user} } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("roommate_requests")
    .select(`
      id,
      status,
      receiver_id,
      profiles!roommate_requests_receiver_id_fkey(
        id,
        full_name,
        branch,
        academic_year,
        gender,
        bio
      )
    `)
    .eq("sender_id", user.id);


  if(error){
    console.log("Sent request error:", error);
    return;
  }


  console.log("Sent requests:", data);


  setSentRequests(
    data.map(request => ({
      ...request.profiles,

      name: request.profiles.full_name,

      avatar: request.profiles.full_name
        ?.split(" ")
        .map(x=>x[0])
        .join("")
        .slice(0,2),

      color:"#2563EB",

      year:
        request.profiles.academic_year
        ? `${request.profiles.academic_year} year`
        : "",

      branch: request.profiles.branch,

      status: request.status,

      date:"Today"
    }))
  );

}

async function fetchIncomingRequests(){

  const { data:{user} } = await supabase.auth.getUser();


  const { data, error } = await supabase
    .from("roommate_requests")
    .select(`
      id,
      status,
      sender_id,
      created_at,
      profiles!roommate_requests_sender_id_fkey(
        id,
        full_name,
        branch,
        academic_year,
        gender,
        bio
      )
    `)
    .eq("receiver_id", user.id)
    .eq("status", "pending");


  if(error){
    console.log("Incoming request error:", error);
    return;
  }


  console.log("Incoming requests:", data);


  setRequests(
 data.map(request => ({
   ...request.profiles,
   name: request.profiles.full_name,
   id: request.id,
   candidate_id: request.sender_id,
   status: "incoming",
   date: "Today"
 }))
);

}
async function testProfiles(){

  const { data, error } = await supabase
    .from("profiles")
    .select("*");

  if(error){
    console.log("Database error:", error);
    return;
  }

  console.log("Profiles:", data);

}

useEffect(()=>{

  async function init(){

    const {data:{user}} = await supabase.auth.getUser();

    console.log("AUTH USER:", user);

    setCurrentUser(user);

    if(user){
      await loadUserProfile();
      await testProfiles();
      await fetchSentRequests();
      await fetchMatches();
      await fetchIncomingRequests();
    }

  }

  init();

},[screen]);

const [sentRequests, setSentRequests] = useState([]);
const [students, setStudents] = useState([]);
const [connections, setConnections] = useState([
  {
    name: "Kabir Mehta",
    status: "accepted",
    date: "2 days ago"
  }
]);
  const [requestPanel, setRequestPanel] = useState(false);
  const [personModal, setPersonModal] = useState(null);
  const [toast, setToast] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('roommate-theme', theme);
  }, [theme]);
  const tell = message => { setToast(message); setTimeout(() => setToast(''), 2400); };
  const initials = profile.name.split(' ').map(word => word[0]).join('').slice(0, 2);
  const matches = useMemo(() => {

return students
.map(person => ({
  
  ...person,

  name: person.full_name,

  year: `${person.academic_year}${person.academic_year === 1 ? "st" : "th"} year`,

  hostel: person.preferred_hostel,

  compatibility: person.match_percentage,

  avatar: person.full_name
    ?.split(" ")
    .map(x => x[0])
    .join("")
    .slice(0,2),

  color: "#2563EB",

  preferences:{
  interests: person.interests || [],

  roomType:
    person.roommates_in_room === 1 ? "Single" :
    person.roommates_in_room === 2 ? "Two sharing" :
    person.roommates_in_room === 3 ? "Three sharing" :
    "Four sharing",

  roommateYear: "Any year",

  sleep: person.sleep_schedule,

  wake: new Date(`1970-01-01T${person.wake_up_time}`)
  .toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }),

  study: person.study_habit,

  clean:
    person.cleanliness_level >= 5
      ? "Very tidy"
      : person.cleanliness_level >= 3
      ? "Balanced"
      : "Relaxed",

  food: person.food_preference,

  noise:
    person.noise_tolerance === 1
      ? "Low"
      : person.noise_tolerance === 3
      ? "Medium"
      : "High"
}

}))

.sort(
(a,b)=>b.compatibility-a.compatibility
);


},[students]);
  const shown = matches.filter(person => (filter === 'All' || person.hostel === filter) && person.name.toLowerCase().includes(query.toLowerCase()));
  const accept = name => {

  setRequests(old =>
    old.filter(item => item.name !== name)
  );

  setConnections(old =>
    old.some(item => item.name === name)
      ? old
      : [
          ...old,
          {
            name,
            status: "accepted",
            date: "Today"
          }
        ]
  );

  setRequestPanel(false);

  tell(`${name} is now in your chats`);
};
  const sendRequest = async (person) => {

  if (sentRequests.some(item => item.name === person.name)) {
    return tell(`Request already sent to ${person.name}`);
  }

  const { data, error } = await supabase.rpc(
    "send_roommate_request",
    {
      p_receiver_id: person.candidate_id
    }
  );


  if(error){
    console.log("Request error:", error);
    tell(error.message);
    return;
  }


  console.log("Request sent:", data);


  setSentRequests(old => [
    ...old,
    {
      name: person.name,
      status: "pending",
      date: "Today"
    }
  ]);


  tell(`Connection request sent to ${person.name}`);
};
  const withdrawRequest = name => {

  setSentRequests(old =>
    old.filter(item => item.name !== name)
  );

  tell(`Request to ${name} withdrawn`);

};

  if (screen === 'welcome') return <><TopBar /><Landing open={mode => { setAuthMode(mode); setScreen('auth'); }} /></>;
  if (screen === 'auth') return <><TopBar /><Auth mode={authMode} setMode={setAuthMode} back={() => setScreen('welcome')} continueTo={() => setScreen(authMode === 'signup' ? 'onboard' : 'dashboard')} /></>;
  if (screen === 'onboard') return <><TopBar /><Onboarding profile={profile} setProfile={setProfile} step={onboardStep} setStep={setOnboardStep} done={async () => {
console.log("CREATE PROFILE CLICKED");
  const { data: { user } } = await supabase.auth.getUser();


  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: profile.name,
      branch: profile.branch,
      academic_year: Number(profile.year.replace(/\D/g, "")),
      gender: profile.gender?.toLowerCase(),
      bio: profile.bio,
      is_profile_complete: true
    })
    .eq("id", user.id);


  if(error){
    console.log("Profile save error:", error);
    return;
  }

const { error: detailsError } = await supabase
.from("student_details")
.upsert({
  user_id: user.id,
  academic_score: Number(profile.score)
});

if(detailsError){
  console.log("Student details error:", detailsError);
  return;
}


const { error: preferenceError } = await supabase
.from("roommate_preferences")
.insert({
  user_id: user.id,

  preferred_hostel: profile.hostel,

  roommates_in_room:
    profile.preferences.roomType === "Single" ? 1 :
    profile.preferences.roomType === "Two sharing" ? 2 :
    profile.preferences.roomType === "Three sharing" ? 3 : 4,

  sleep_schedule: profile.preferences.sleep,

  wake_up_time:
    profile.preferences.wake === "5:30 AM" ? "05:30:00" :
    profile.preferences.wake === "6:30 AM" ? "06:30:00" :
    profile.preferences.wake === "7:00 AM" ? "07:00:00" :
    profile.preferences.wake === "8:00 AM" ? "08:00:00" :
    profile.preferences.wake === "9:00 AM" ? "09:00:00" :
    profile.preferences.wake === "10:00 AM" ? "10:00:00" :
    "11:00:00",

  study_habit: profile.preferences.study,

  cleanliness_level:
    profile.preferences.clean === "Very tidy" ? 5 :
    profile.preferences.clean === "Balanced" ? 3 : 1,

  food_preference: profile.preferences.food,

  noise_tolerance:
    profile.preferences.noise === "Low" ? 1 :
    profile.preferences.noise === "Medium" ? 3 : 5
});


if(preferenceError){
  console.log("Preference save error:", preferenceError);
  return;
}


const { data: interestData, error: interestFetchError } = await supabase
  .from("interests")
  .select("id, name");


if(interestFetchError){
  console.log("Interest fetch error:", interestFetchError);
  return;
}


const selectedInterests = interestData
  .filter(item => profile.preferences.interests.includes(item.name))
  .map(item => ({
    user_id: user.id,
    interest_id: item.id
  }));


const { error: userInterestError } = await supabase
  .from("user_interests")
  .insert(selectedInterests);


if(userInterestError){
  console.log("User interest error:", userInterestError);
  return;
}


setScreen("dashboard");

  tell("Profile created — welcome to Roommate Finder!");

}} /></>;

  return <><TopBar /><main className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <Sidebar screen={screen} setScreen={setScreen} profile={profile} initials={initials} open={accountOpen} setOpen={setAccountOpen} collapsed={sidebarCollapsed} toggleCollapsed={() => setSidebarCollapsed(value => !value)} sentRequestCount={requests.length} signOut={async () => {

  await supabase.auth.signOut();

  setProfile({
    name: "",
    gender: "",
    year: "",
    branch: "",
    hostel: "",
    score: "",
    bio: "",
    preferences: defaultPreferences
  });

  setAccountOpen(false);
  setScreen("welcome");

  window.location.reload();

}} />
    <section className="app-content">
      {screen === 'dashboard' && <Dashboard profile={profile} matches={matches} requests={requests} openRequests={() => setRequestPanel(true)} openPerson={setPersonModal} sendRequest={sendRequest} sentRequests={sentRequests} setScreen={setScreen} />}
      {screen === 'find' && <Finder profile={profile} shown={shown} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} openPerson={setPersonModal} sendRequest={sendRequest} sentRequests={sentRequests} />}
      {screen === 'requests' && 
<Requests 
requests={requests}
sentRequests={sentRequests}
connections={connections}
people={students}
withdrawRequest={withdrawRequest}
accept={accept}
setScreen={setScreen}
/>
}
      {screen === 'chat' && <Chat connections={connections} people={students} profile={profile} />}
      {screen === 'settings' && <Settings profile={profile} setProfile={setProfile} tell={tell} theme={theme} setTheme={setTheme} />}
    </section>
    {requestPanel && <RequestPanel requests={requests} people={students} close={() => setRequestPanel(false)} accept={accept} />}
    {personModal && <ProfileModal person={personModal} profile={profile} close={() => setPersonModal(null)} connect={() => sendRequest(personModal)} requestSent={sentRequests.some(item => item.name === personModal.name)} />}
    {toast && <div className="toast">✓ {toast}</div>}
  </main></>;
}

function TopBar() { return <header className="oneforall-bar"><img className="oneforall-mark" src="/mlsc-logo.png" alt="MLSC" /><nav className="oneforall-nav" aria-label="OneForAll products"><a href="#top" className="oneforall-name">ONE FOR ALL</a><a href="#top">Home</a><a href="#top" className="current">Roommate Finder</a><a href="#top">Campus Map</a><a href="#top">Mess</a><a href="#top">SkillSync</a></nav><div className="topbar-actions"><button className="oneforall-avatar" title="Your OneForAll account">S</button></div></header>; }

function Landing({ open }) { const goTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return <main className="landing" id="top"><nav><div className="brand">Roommate Finder</div><div className="navlinks"><button className="nav-link" onClick={() => goTo('how-it-works')}>How it works</button><button className="nav-link" onClick={() => goTo('why-roommate-finder')}>Why Roommate Finder?</button><button className="ghost" onClick={() => open('signin')}>Sign in</button><button onClick={() => open('signup')}>Find your roommate</button></div></nav><section className="hero"><div><p className="eyebrow">MADE FOR THAPAR STUDENTS</p><h1>Your room feels better<br />with the <i>right person.</i></h1><p className="lede">Roommate Finder helps Thaparians find a compatible roommate based on the things that actually matter: routine, room habits, hostel and vibe.</p><button className="large" onClick={() => open('signup')}>Create your profile <b>→</b></button></div><div className="hero-card"><div className="card-head"><span>YOUR BEST MATCH</span><b>96% fit</b></div><div className="match-person"><div className="avatar big">AS</div><div><h3>Aarav Sharma</h3><p>2nd year · COE · Hostel H</p></div></div><div className="chips"><em>Early riser</em><em>Football</em><em>Clean space</em></div><button className="full" onClick={() => open('signup')}>Find your match</button></div></section><section className="landing-section how" id="how-it-works"><p className="eyebrow">HOW IT WORKS</p><h2>Find a roommate in three easy steps.</h2><div className="steps"><article><b>01</b><h3>Build your profile</h3><p>Tell us your hostel, room preference, daily routine and the things you enjoy.</p></article><article><b>02</b><h3>See compatible people</h3><p>We compare the details that make sharing a room comfortable, not just a course or year.</p></article><article><b>03</b><h3>Connect with confidence</h3><p>Review profiles, send a request and chat with the people who feel like a good fit.</p></article></div></section><section className="landing-section why" id="why-roommate-finder"><p className="eyebrow">WHY ROOMMATE FINDER</p><h2>A better room starts with a better match.</h2><div className="why-grid"><article><h3>Less guesswork</h3><p>Compare sleep schedules, cleanliness, study style and room type before moving in.</p></article><article><h3>Made for Thapar</h3><p>Hostel-aware matching makes it easy to find relevant people from your own campus community.</p></article><article><h3>More comfortable living</h3><p>Start conversations with shared expectations and make room life feel more like home.</p></article></div></section></main>; }

function Auth({ mode, setMode, back, continueTo }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  async function handleAuth(event){

    event.preventDefault();
    console.log("SIGNUP CLICKED", email, password);


    const { data, error } = mode === "signup"
      ?
      await supabase.auth.signUp({
        email,
        password
      })
      :
      await supabase.auth.signInWithPassword({
        email,
        password
      });


    if(error){
      console.log(error.message);
      return;
    }


    console.log("AUTH SUCCESS:", data);

    continueTo();

  }


  return (
    <main className="auth-page">

      <section className="auth-card">

        <button className="back-link" onClick={back}>
          ← Back to Roommate Finder
        </button>

        <div className="brand">
          Roommate Finder
        </div>

        <p className="eyebrow">
          THAPAR STUDENT COMMUNITY
        </p>

        <h1>
          {mode === 'signup'
          ? 'Create your account'
          : 'Welcome back'}
        </h1>

        <p>
          {mode === 'signup'
          ? 'Start with your Thapar email. Your complete profile comes next.'
          : 'Sign in to see your matches and conversations.'}
        </p>


        <form onSubmit={handleAuth}>

          <Field
            label="Thapar email"
            value={email}
            onChange={setEmail}
            placeholder="you@thapar.edu"
          />


          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />


          <button className="full">
            {mode === 'signup'
            ? 'Continue to profile →'
            : 'Sign in →'}
          </button>

        </form>


        <div className="auth-switch">

          {mode === 'signup'
          ? 'Already have an account?'
          : 'New to Roommate Finder?'}

          <button
            onClick={() =>
              setMode(mode === 'signup' ? 'signin' : 'signup')
            }
          >
            {mode === 'signup'
            ? 'Sign in'
            : 'Create an account'}
          </button>

        </div>

      </section>

    </main>
  );

}

function Onboarding({ profile, setProfile, step, setStep, done }) {
  const update = (field, value) => setProfile(current => ({ ...current, [field]: value }));
  const updatePreference = (field, value) => setProfile(current => ({ ...current, preferences: { ...current.preferences, [field]: value } }));
  const titles = ['Let’s start with you.', 'Your room, your rules.', 'The little things matter.', 'Make it feel like you.'];
  const descriptions = ['We’ll use this to find people who fit your everyday life.', 'We only show hostels that are relevant to you.', 'A good roommate respects your rhythm.', 'A little personality makes matching easier.'];

  return <main className="onboard">
    <div className="on-logo">Roommate Finder <small>for Thapar</small></div>
    <div className="progress"><i style={{ width: `${(step + 1) * 25}%` }} /></div>
    <section className="form-wrap">
      <div className="form-copy"><p className="eyebrow">STEP {step + 1} OF 4</p><h1>{titles[step]}</h1><p>{descriptions[step]}</p></div>
      <div className="form-card">
        {step === 0 && <>
          <Field label="Full name" value={profile.name} onChange={value => update('name', value)} />
          <div className="two">
            <Select label="Year" value={profile.year} options={['1st year', '2nd year', '3rd year', '4th year']} onChange={value => update('year', value)} />
            <Select label="Gender" value={profile.gender} options={['Male', 'Female']} onChange={value => setProfile(current => ({ ...current, gender: value, hostel: HOSTELS[value][0] }))} />
          </div>
          <Select label="Branch" value={profile.branch} options={BRANCHES} onChange={value => update('branch', value)} />
          <Field label={profile.year === '1st year' ? 'JEE percentile' : 'CGPA'} value={profile.score} onChange={value => update('score', value)} hint="Used only to find peers in a similar academic range." />
        </>}
        {step === 1 && <>
          <div className="hostel-note">Showing {profile.gender === 'Male' ? 'boys’' : 'girls’'} hostels only</div>
          <Select label="Preferred hostel" value={profile.hostel} options={HOSTELS[profile.gender] || []} onChange={value => update('hostel', value)} />
          <Select label="Room type" value={profile.preferences.roomType} options={ROOM_TYPES} onChange={value => updatePreference('roomType', value)} />
          <Select label="Food preference" value={profile.preferences.food} options={['Vegetarian', 'Non-vegetarian', 'No preference']} onChange={value => updatePreference('food', value)} />
          <Select label="Roommate year" value={profile.preferences.roommateYear} options={['Same year', 'Any year', 'No preference']} onChange={value => updatePreference('roommateYear', value)} />
        </>}
        {step === 2 && <>
          <Select label="Sleep schedule" value={profile.preferences.sleep} options={['Early bird', 'Flexible', 'Night owl']} onChange={value => updatePreference('sleep', value)} />
          <Select label="Wake-up time" value={profile.preferences.wake} options={WAKE_TIMES} onChange={value => updatePreference('wake', value)} />
          <Select label="Cleanliness" value={profile.preferences.clean} options={['Very tidy', 'Balanced', 'Relaxed']} onChange={value => updatePreference('clean', value)} />
          <Select label="Study vibe" value={profile.preferences.study} options={['Quiet focus', 'Balanced', 'Social']} onChange={value => updatePreference('study', value)} />
          <Select label="Noise tolerance" value={profile.preferences.noise} options={['Low', 'Medium', 'High']} onChange={value => updatePreference('noise', value)} />
        </>}
        {step === 3 && <>
          <Field label="A little about you" value={profile.bio} onChange={value => update('bio', value)} textarea />
          <h3>Interests</h3>
          <InterestPicker selected={profile.preferences.interests} onChange={value => updatePreference('interests', value)} />
        </>}
        <div className="form-actions">
          <button className="ghost" onClick={() => setStep(Math.max(0, step - 1))}>← Back</button>
          <button onClick={() => step < 3 ? setStep(step + 1) : done()}>{step === 3 ? 'Create profile' : 'Continue →'}</button>
        </div>
      </div>
    </section>
  </main>;
}

function Sidebar({ screen, setScreen, profile, initials, open, setOpen, collapsed, toggleCollapsed, sentRequestCount, signOut }) { return <aside><div className="side-heading"><div className="side-brand">Roommate Finder</div><button className="collapse-toggle" onClick={toggleCollapsed} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? '›' : '‹'}</button></div><div className="side-nav"><button title="Discover" className={screen === 'dashboard' ? 'active' : ''} onClick={() => setScreen('dashboard')}><b>⌂</b><span>Discover</span></button><button title="Find roommates" className={screen === 'find' ? 'active' : ''} onClick={() => setScreen('find')}><b>⌕</b><span>Find roommates</span></button><button title="Requests" className={screen === 'requests' ? 'active' : ''} onClick={() => setScreen('requests')}><b>↗</b><span>Requests</span>{sentRequestCount > 0 && <i className="request-count">{sentRequestCount}</i>}</button><button title="Chats" className={screen === 'chat' ? 'active' : ''} onClick={() => setScreen('chat')}><b className="chat-icon" aria-hidden="true" /><span>Chats</span></button><button title="Settings" className={screen === 'settings' ? 'active' : ''} onClick={() => setScreen('settings')}><b>⚙</b><span>Settings</span></button></div><div className="account-wrap"><button className="account" title="Open account menu" onClick={() => setOpen(!open)}><div className="avatar">{initials}</div><div><b>{profile.name}</b><small>{profile.hostel}</small></div><span>{open ? '⌃' : '⌄'}</span></button>{open && <div className="account-menu"><button onClick={() => { setScreen('settings'); setOpen(false); }}>⚙ Account settings</button><button className="signout" onClick={signOut}>↪ Sign out</button></div>}</div></aside>; }

function Dashboard({ profile, matches, requests, openRequests, openPerson, sendRequest, sentRequests, setScreen }) {

const top = matches[0];

if(!top){
  return (
    <>
      <header className="app-head">
        <div>
          <p className="eyebrow">
            GOOD AFTERNOON, {profile.name.split(' ')[0].toUpperCase()}
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
} return <><header className="app-head"><div><p className="eyebrow">GOOD AFTERNOON, {profile.name.split(' ')[0].toUpperCase()}</p><h1>People you’ll get along with.</h1><p>Your compatibility updates every time you update your preferences.</p></div><button className="bell" onClick={openRequests}>♢{requests.length > 0 && <i />}</button></header><section className="feature-match"><div><p className="eyebrow">TOP MATCH FOR YOU</p><h2>{top.name} <span>{top.compatibility}% compatible</span></h2><p>Shared routines, room habits, and interests make this an especially strong fit.</p><div className="chips">{top.preferences.interests.slice(0, 3).map(item => <em key={item}>{item}</em>)}</div><button onClick={() => openPerson(top)}>View full profile →</button></div><div className="feature-art"><div className="avatar huge" style={{ background: top.color }}>{top.avatar}</div><div className="quote">“{top.bio}”</div></div></section><section className="section-head"><div><h2>Great fits</h2><p>Matches from your current preferences.</p></div><button className="text-button" onClick={() => setScreen('find')}>See all →</button></section><div className="card-grid">{matches.slice(1, 4).map(person => <PersonCard key={person.name} person={person} openPerson={openPerson} sendRequest={sendRequest} requestSent={sentRequests.includes(person.name)} />)}</div></>; }

function Finder({ profile, shown, filter, setFilter, query, setQuery, openPerson, sendRequest, sentRequests }) { return <><header className="app-head compact"><div><p className="eyebrow">EXPLORE YOUR COMMUNITY</p><h1>Find your people.</h1></div></header><div className="searchbar"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name, branch, interest..." /></div><div className="filter-row"><b>Showing {shown.length} {profile.gender === 'Female' ? 'women' : 'men'}</b>{['All', ...HOSTELS[profile.gender]].map(hostel => <button key={hostel} className={filter === hostel ? 'selected' : ''} onClick={() => setFilter(hostel)}>{hostel}</button>)}</div><section className="near-title"><div><h2>Best fits</h2><p>Highly compatible with your lifestyle.</p></div></section><div className="card-grid">{shown.filter(person => person.compatibility >= 82).map(person => <PersonCard key={person.candidate_id} person={person} openPerson={openPerson} sendRequest={sendRequest} requestSent={sentRequests.includes(person.name)} />)}</div><section className="near-title"><div><h2>Worth a look</h2><p>Different in a few ways, still potentially a good room fit.</p></div></section><div className="card-grid">{shown.filter(person => person.compatibility < 82).map(person => <PersonCard key={person.name} person={person} openPerson={openPerson} sendRequest={sendRequest} requestSent={sentRequests.includes(person.name)} />)}</div></>; }

function PersonCard({ person, openPerson, sendRequest, requestSent }) { return <article className="person-card"><div className="person-top"><div className="avatar" style={{ background: person.color }}>{person.avatar}</div><span className="score">{person.compatibility}%</span></div><h3>{person.name}</h3><p>{person.year} · {shortBranch(person.branch)}</p><p className="hostel">⌂ {person.hostel}</p><div className="chips">{person.preferences.interests.slice(0, 3).map(item => <em key={item}>{item}</em>)}</div><div className="card-actions"><button className="view" onClick={() => openPerson(person)}>View profile</button><button className={`connect ${requestSent ? 'sent' : ''}`} onClick={() => sendRequest(person)} disabled={requestSent}>{requestSent ? 'Request sent' : 'Connect +'}</button></div></article>; }

function ProfileModal({ person, profile, close, connect, requestSent }) { const prefs = person.preferences; return <div className="inbox-overlay profile-overlay"><section className="profile-modal"><header><div><p className="eyebrow">ROOMMATE PROFILE</p><h2>{person.name}</h2></div><button className="close" onClick={close}>×</button></header><div className="modal-person"><div className="avatar huge" style={{ background: person.color }}>{person.avatar}</div><div><p>{person.year} · {person.branch}</p><p>⌂ {person.hostel}</p><span className="score">{person.compatibility}% compatible with you</span></div></div><p className="bio">{person.bio}</p><h3>Room & lifestyle preferences</h3><div className="pref-grid"><Preference label="Room type" value={prefs.roomType} /><Preference label="Food" value={prefs.food} /><Preference label="Sleep style" value={prefs.sleep} /><Preference label="Wake-up time" value={prefs.wake} /><Preference label="Cleanliness" value={prefs.clean} /><Preference label="Study vibe" value={prefs.study} /><Preference label="Noise tolerance" value={prefs.noise} /><Preference label="Roommate year" value={prefs.roommateYear} /></div><h3>Interests</h3><div className="chips">{prefs.interests.map(item => <em key={item}>{item}</em>)}</div><button className={`full modal-connect ${requestSent ? 'sent' : ''}`} onClick={() => { if (!requestSent) connect(); close(); }} disabled={requestSent}>{requestSent ? 'Connection request sent' : 'Send connection request'}</button></section></div>; }

function Requests({ requests, sentRequests, connections, people, withdrawRequest, accept, setScreen }) {

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
onClick={() => setScreen("find")}
>
View profile
</button>


<button className="reject">
Reject
</button>


<button 
className="approve"
onClick={()=>accept(person.name)}
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
onClick={() => console.log(person)}
>
View profile
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



function RequestPanel({ requests, people, close, accept }) { return <div className="inbox-overlay"><section className="inbox"><header><div><p className="eyebrow">CONNECTION REQUESTS</p><h2>Notifications</h2></div><button className="close" onClick={close}>×</button></header>{requests.length ? requests.map(request => {

 const person = people.find(
   item => item.name === request.name
 ); return <article className="request" key={request.name}><div className="avatar" style={{ background: person.color }}>{person.avatar}</div><div><h3>{person.name}</h3><p>{person.compatibility || 'A strong'} compatibility match.</p><small>
  Sent {request.date}
</small></div><div><button className="accept" onClick={() => accept(request.name)}>Accept</button><button className="decline" onClick={close}>Ignore</button></div></article>; }) : <div className="empty"><div>✦</div><h3>All caught up</h3><p>New requests will appear here.</p></div>}</section></div>; }

function Chat({ connections, people, profile }) {

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

function Settings({ profile, setProfile, tell, theme, setTheme }) { const [editing, setEditing] = useState(false); const [draft, setDraft] = useState(profile); const [notifications, setNotifications] = useState({ requests: true, chat: true, private: false, online: true }); const change = (field, value) => setDraft({ ...draft, [field]: value }); const changePref = (field, value) => setDraft({ ...draft, preferences: { ...draft.preferences, [field]: value } }); const save = () => { setProfile(draft); setEditing(false); tell('Profile and compatibility updated'); }; const chooseTheme = value => { const nextTheme = value.toLowerCase(); setTheme(nextTheme); document.documentElement.dataset.theme = nextTheme; localStorage.setItem('roommate-theme', nextTheme); tell(`${value} mode enabled`); };
 return <><header className="app-head compact"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile & settings</h1><p>Every profile field and preference is editable here.</p></div></header><div className="settings-grid"><section className="settings-card profile-card"><div className="avatar hero-avatar">{profile.name.split(' ').map(word => word[0]).join('').slice(0, 2)}</div><div><h2>{profile.name}</h2><p>{profile.year} · {profile.branch}</p><span className="verified">● Thapar student</span></div><button className="ghost profile-edit" onClick={() => { setDraft(profile); setEditing(!editing); }}>{editing ? 'Cancel' : 'Edit full profile'}</button></section>{editing ? <FullProfileForm draft={draft} change={change} changePref={changePref} save={save} cancel={() => setEditing(false)} /> : <ProfileSummary profile={profile} edit={() => { setDraft(profile); setEditing(true); }} />}<section className="settings-card"><h2>Notifications</h2><Toggle label="Connection requests" description="Know when someone wants to connect." value={notifications.requests} onChange={value => setNotifications({ ...notifications, requests: value })} /><Toggle label="Messages & chat" description="Get updates from your accepted matches." value={notifications.chat} onChange={value => setNotifications({ ...notifications, chat: value })} /></section><section className="settings-card"><h2>Appearance</h2><p>Choose how Roommate Finder looks on this device.</p><div className="theme-options"><button className={theme === 'light' ? 'theme-selected' : ''} onClick={() => chooseTheme('Light')}>☀ <b>Light</b><small>Bright and clean</small></button><button className={theme === 'dark' ? 'theme-selected' : ''} onClick={() => chooseTheme('Dark')}>☾ <b>Dark</b><small>Easy on your eyes</small></button></div></section><section className="settings-card"><h2>Privacy</h2><Toggle label="Private profile" description="Only approved connections see your full profile." value={notifications.private} onChange={value => setNotifications({ ...notifications, private: value })} /><Toggle label="Show online status" description="Let your connections know when you’re active." value={notifications.online} onChange={value => setNotifications({ ...notifications, online: value })} /></section><section className="settings-card danger-card"><h2>Account</h2><p>Deleting your account permanently removes your profile, matches, and chats.</p><button className="danger" onClick={() => window.confirm('Delete your Roommate Finder account permanently?') && tell('Account deletion requested')}>Delete account</button></section></div></>; }

function ProfileSummary({ profile, edit }) { return <section className="settings-card"><h2>About you <button className="text-button" onClick={edit}>Edit</button></h2><p className="bio">{profile.bio}</p><div className="pref-grid"><Preference label="Gender" value={profile.gender} /><Preference label="Year" value={profile.year} /><Preference label="Branch" value={profile.branch} /><Preference label="Hostel" value={profile.hostel} /><Preference label={profile.year === '1st year' ? 'JEE percentile' : 'CGPA'} value={profile.score} /><Preference label="Sleep style" value={profile.preferences.sleep} /><Preference label="Cleanliness" value={profile.preferences.clean} /><Preference label="Noise tolerance" value={profile.preferences.noise} /></div></section>; }

function FullProfileForm({ draft, change, changePref, save, cancel }) { const selectable = (label, field, options) => <Select label={label} value={draft.preferences[field]} options={options} onChange={value => changePref(field, value)} />; return <section className="settings-card full-editor"><h2>Edit your full profile</h2><p>Update anything—your matches will recalculate after you save.</p><h3>Personal & academic</h3><div className="editor-grid"><Field label="Full name" value={draft.name} onChange={value => change('name', value)} /><Select label="Gender" value={draft.gender} options={['Male', 'Female']} onChange={value => change('gender', value)} /><Select label="Year" value={draft.year} options={['1st year', '2nd year', '3rd year', '4th year']} onChange={value => change('year', value)} /><Select label="Branch" value={draft.branch} options={BRANCHES} onChange={value => change('branch', value)} /><Select label="Preferred hostel" value={draft.hostel} options={HOSTELS[draft.gender]} onChange={value => change('hostel', value)} /><Field label={draft.year === '1st year' ? 'JEE percentile' : 'CGPA'} value={draft.score} onChange={value => change('score', value)} /></div><Field label="About me" value={draft.bio} onChange={value => change('bio', value)} textarea /><h3>Room & lifestyle preferences</h3><div className="editor-grid">{selectable('Room type', 'roomType', ROOM_TYPES)}{selectable('Roommate year', 'roommateYear', ['Same year', 'Any year', 'No preference'])}{selectable('Food preference', 'food', ['Vegetarian', 'Non-vegetarian', 'No preference'])}{selectable('Sleep schedule', 'sleep', ['Early bird', 'Flexible', 'Night owl'])}{selectable('Wake-up time', 'wake', WAKE_TIMES)}{selectable('Cleanliness', 'clean', ['Very tidy', 'Balanced', 'Relaxed'])}{selectable('Study vibe', 'study', ['Quiet focus', 'Balanced', 'Social'])}{selectable('Noise tolerance', 'noise', ['Low', 'Medium', 'High'])}</div><h3>Interests</h3><InterestPicker selected={draft.preferences.interests} onChange={value => changePref('interests', value)} /><div className="form-actions"><button className="ghost" onClick={cancel}>Cancel</button><button onClick={save}>Save & update matches</button></div></section>; }

function InterestPicker({ selected, onChange }) { const interests = ['Sports', 'Music', 'Gaming', 'Reading', 'Cooking', 'Travel', 'Movies']; return <div className="choice"><div>{interests.map(item => <button key={item} className={selected.includes(item) ? 'picked' : ''} onClick={() => onChange(selected.includes(item) ? selected.filter(value => value !== item) : [...selected, item])}>{item}</button>)}</div></div>; }
function Toggle({ label, description, value, onChange }) { return <div className="toggle-row"><div><b>{label}</b><p>{description}</p></div><button className={value ? 'toggle on' : 'toggle'} onClick={() => onChange(!value)}><i /></button></div>; }
function Preference({ label, value }) { return <div className="preference"><small>{label}</small><b>{value}</b></div>; }
function Field({ label, value, onChange, placeholder = '', type = 'text', textarea }) { return <label className="field">{label}{textarea ? <textarea value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /> : <input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />}</label>; }
function Select({ label, value, options, onChange }) { return <label className="field">{label}<select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>; }
function shortBranch(branch) { return branch.includes('Computer Engineering') ? 'COE' : branch.includes('Computer Science') ? 'CSE' : branch; }

createRoot(document.getElementById('root')).render(<App />);
