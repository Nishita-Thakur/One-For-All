export default function TopBar({ initials }) {
  const roommateUrl = import.meta.env.VITE_ROOMMATE_URL || 'http://localhost:5173';
  const messUrl = import.meta.env.VITE_MESS_URL || 'http://localhost:5174';
  return <header className="oneforall-bar">
    <img className="oneforall-mark" src="/mlsc-logo.png" alt="MLSC" />
    <nav className="oneforall-nav" aria-label="OneForAll products">
      <a href="#top" className="oneforall-name">ONE FOR ALL</a><a href="#top">Home</a><a href={roommateUrl}>Roommate Finder</a>
      <a href="#top">Campus Map</a><a href={messUrl} className="current">Mess</a><a href="#top">SkillSync</a>
    </nav>
    {initials && <div className="topbar-actions"><span className="oneforall-avatar">{initials}</span></div>}
  </header>;
}
