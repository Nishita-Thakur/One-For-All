export function getScore(profile, person) {
  const a = profile.preferences, b = person.preferences;
  const checks = [a.sleep === b.sleep, a.clean === b.clean, a.study === b.study, a.noise === b.noise, a.food === b.food, a.roommateYear === 'Any year' || a.roommateYear === person.year];
  const shared = a.interests.filter(item => b.interests.includes(item)).length;
  return Math.min(98, Math.max(62, 64 + checks.filter(Boolean).length * 5 + shared * 4 + (profile.hostel === person.hostel ? 3 : 0)));
}
