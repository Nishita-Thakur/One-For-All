import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import ProfileModal from './components/ProfileModal';
import RequestPanel from './components/RequestPanel';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { HOSTELS, defaultPreferences } from './data/constants';
import { initialTheme } from './lib/theme';
import Auth from './screens/Auth';
import Chat from './screens/Chat';
import Dashboard from './screens/Dashboard';
import Finder from './screens/Finder';
import Landing from './screens/Landing';
import Onboarding from './screens/Onboarding';
import Requests from './screens/Requests';
import Settings from './screens/Settings';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [authMode, setAuthMode] = useState('signup');
  const [onboardStep, setOnboardStep] = useState(0);
  const [theme, setTheme] = useState(initialTheme);
  const [profile, setProfile] = useState({
  name: '',
  gender: 'Male',
  year: '',
  branch: '',
  hostel: HOSTELS.Male[0],
  score: '',
  bio: '',
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

  name: data.full_name ?? prev.name,

  gender: data.gender
    ? data.gender.charAt(0).toUpperCase() +
      data.gender.slice(1).toLowerCase()
    : prev.gender,

  branch: data.branch ?? prev.branch,

  bio: data.bio ?? prev.bio
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

    candidate_id: request.receiver_id,   // <-- ADD THIS LINE

    name: request.profiles.full_name,

    avatar: request.profiles.full_name
      ?.split(" ")
      .map(x => x[0])
      .join("")
      .slice(0, 2),

    color: "#2563EB",

    year:
      request.profiles.academic_year
        ? `${request.profiles.academic_year} year`
        : "",

    branch: request.profiles.branch,

    status: request.status,

    date: "Today"
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


async function openCandidateProfile(candidateId){

  const { data, error } = await supabase.rpc(
    "get_candidate_profile",
    {
      p_candidate_id: candidateId
    }
  );

  if (error) {
  console.log(error);
  alert(error.message);
  return;
}

  const person = data[0];

  setPersonModal({

    candidate_id: person.candidate_id,

    name: person.full_name,

    avatar: person.full_name
      ?.split(" ")
      .map(x=>x[0])
      .join("")
      .slice(0,2)
      .toUpperCase(),

    color:"#2563EB",

    bio: person.bio,

    year: `${person.academic_year}${
      person.academic_year===1 ? "st" :
      person.academic_year===2 ? "nd" :
      person.academic_year===3 ? "rd" : "th"
    } year`,

    branch: person.branch,

    hostel: person.preferred_hostel,

    compatibility: null,

    preferences:{

      interests: person.interests || [],

      roomType:
        person.roommates_in_room===1 ? "Single" :
        person.roommates_in_room===2 ? "Two sharing" :
        person.roommates_in_room===3 ? "Three sharing" :
        "Four sharing",

      roommateYear:"Any year",

      sleep: person.sleep_schedule,

      wake: new Date(
        `1970-01-01T${person.wake_up_time}`
      ).toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
      }),

      study: person.study_habit,

      clean:
        person.cleanliness_level>=5
        ? "Very tidy"
        : person.cleanliness_level>=3
        ? "Balanced"
        : "Relaxed",

      food: person.food_preference,

      noise:
        person.noise_tolerance===1
        ? "Low"
        : person.noise_tolerance===3
        ? "Medium"
        : "High"
    }

  });

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

    if(user && screen !== "onboard"){
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
  const initials = (profile.name ?? "")
  .split(" ")
  .filter(Boolean)
  .map(word => word[0])
  .join("")
  .slice(0, 2);
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
  const accept = async (requestId, name) => {

  const { error } = await supabase.rpc(
    "respond_to_roommate_request",
    {
      p_request_id: requestId,
      p_decision: "accepted"
    }
  );

  if (error) {
    console.log(error);
    tell(error.message);
    return;
  }

  await fetchIncomingRequests();

  tell(`${name} accepted`);
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

console.log("RPC returned:", data);
console.log("RPC error:", error);


await fetchSentRequests();

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

  console.log("PROFILE:", profile);
console.log("YEAR:", profile.year);
console.log("BRANCH:", profile.branch);
console.log("GENDER:", profile.gender);
console.log("HOSTEL:", profile.hostel);

console.log("YEAR =", profile.year);
console.log(
  "ACADEMIC YEAR =",
  Number(profile.year.replace(/\D/g, ""))
);

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
  academic_score:
  profile.score === ""
    ? null
    : Number(profile.score)
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
      {screen === 'dashboard' && <Dashboard profile={profile} matches={matches} requests={requests} openRequests={() => setRequestPanel(true)} openPerson={openCandidateProfile} sendRequest={sendRequest} sentRequests={sentRequests} setScreen={setScreen} />}
      {screen === 'find' && <Finder profile={profile} shown={shown} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} openPerson={openCandidateProfile} sendRequest={sendRequest} sentRequests={sentRequests} />}
      {screen === 'requests' && 
<Requests
requests={requests}
sentRequests={sentRequests}
connections={connections}
people={students}
withdrawRequest={withdrawRequest}
accept={accept}
setScreen={setScreen}
openPerson={openCandidateProfile}
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
