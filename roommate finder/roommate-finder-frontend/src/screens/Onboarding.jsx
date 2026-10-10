import { Field, Select } from '../components/Field';
import InterestPicker from '../components/InterestPicker';
import { BRANCHES, HOSTELS, ROOM_TYPES, WAKE_TIMES } from '../data/constants';

export default function Onboarding({ profile, setProfile, step, setStep, done }) {
  console.log(JSON.stringify(profile, null, 2));
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
          <Select
  label="Branch"
  value={profile.branch}
  options={BRANCHES}
  onChange={value => {
    console.log("BRANCH CHANGED:", value);
    update("branch", value);
  }}
/>
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
