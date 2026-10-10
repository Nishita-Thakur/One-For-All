import { defaultPreferences } from './constants';

export const student = (name, gender, year, branch, hostel, avatar, color, preferences) => ({ name, gender, year, branch, hostel, avatar, color, bio: 'Looking for a kind, respectful person to share a calm and friendly room with.', preferences });

export const demoStudents = [
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
