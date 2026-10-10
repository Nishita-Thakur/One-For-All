import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MEALS, DAYS, CRITERIA } from '../lib/constants';
import { todayDow, todayISO, fmt } from '../lib/utils';
import Stars from '../components/Stars';
import Empty from '../components/Empty';
import MessPicker from '../components/MessPicker';
import { Field } from '../components/Field';

export default function Rate({ messes, messId, setMessId, mess, menu, tell, fail, reloadSummary }) {
  const [meal, setMeal] = useState(MEALS[0]);
  const [mine, setMine] = useState({});     // menu_item_id -> rating
  const [stats, setStats] = useState({});   // menu_item_id -> stats row
  const [review, setReview] = useState({ food_quality: 0, taste_variety: 0, hygiene: 0, comment: '' });
  const items = useMemo(() => menu.filter(i => i.day_of_week === todayDow() && i.meal === meal), [menu, meal]);

  const loadStats = useCallback(async () => {
    const { data } = await supabase.rpc('get_item_stats', { p_mess_id: messId });
    setStats(Object.fromEntries((data || []).map(r => [r.menu_item_id, r])));
  }, [messId]);
  useEffect(() => { if (messId) loadStats(); }, [messId, loadStats]);
  useEffect(() => {
    if (!messId) return;
    (async () => {
      const [r, v] = await Promise.all([
        supabase.from('item_ratings').select('menu_item_id, rating').eq('rating_date', todayISO()),
        supabase.from('meal_reviews').select('*').eq('mess_id', messId).eq('meal', meal).eq('rating_date', todayISO()).maybeSingle()]);
      setMine(Object.fromEntries((r.data || []).map(x => [x.menu_item_id, x.rating])));
      setReview(v.data ? { ...v.data, comment: v.data.comment || '' } : { food_quality: 0, taste_variety: 0, hygiene: 0, comment: '' });
    })();
  }, [messId, meal]);

  const rateItem = async (item, rating) => {
    const before = mine[item.id];
    setMine(m => ({ ...m, [item.id]: rating }));
    const { error } = await supabase.rpc('submit_item_rating', { p_menu_item_id: item.id, p_rating: rating });
    if (error) { setMine(m => ({ ...m, [item.id]: before })); return fail(error); }
    loadStats();
  };
  const submitReview = async () => {
    if (!review.food_quality || !review.taste_variety || !review.hygiene) return tell('Give all three scores first');
    const { error } = await supabase.rpc('submit_meal_review', { p_mess_id: messId, p_meal: meal, p_food: review.food_quality, p_taste: review.taste_variety, p_hygiene: review.hygiene, p_comment: review.comment });
    if (error) return fail(error);
    tell(`${meal} review saved`); reloadSummary();
  };

  return <>
    <header className="app-head compact"><div><h1>Rate today's food</h1><p>{mess?.name} · {DAYS[todayDow() - 1]}. Ratings are anonymous to other students.</p></div><MessPicker {...{ messes, messId, setMessId }} /></header>
    <div className="request-tabs">{MEALS.map(m => <button key={m} className={meal === m ? 'active' : ''} onClick={() => setMeal(m)}>{m}</button>)}</div>
    {!items.length ? <Empty title={`No ${meal.toLowerCase()} menu for today`} text="Ask an admin to upload this mess's menu." /> : <>
      <section className="settings-card"><h2>Rate a dish</h2>
        {items.map(item => { const s = stats[item.id]; return <div className="rate-row" key={item.id}>
          <div><b>{item.name}</b><small>{s?.count_today ? `Today ${fmt(s.avg_today)} · ${s.count_today} rating${s.count_today > 1 ? 's' : ''}` : 'Be the first to rate this today'}</small></div>
          <Stars value={mine[item.id]} label={`Rate ${item.name}`} onChange={n => rateItem(item, n)} /></div>; })}
      </section>
      <section className="settings-card"><h2>Rate the whole {meal.toLowerCase()}</h2>
        {CRITERIA.map(([key, label]) => <div className="rate-row" key={key}><b>{label}</b><Stars value={review[key]} label={label} onChange={n => setReview(r => ({ ...r, [key]: n }))} /></div>)}
        <Field label="Anything to add? (optional)" textarea value={review.comment} onChange={v => setReview(r => ({ ...r, comment: v.slice(0, 500) }))} />
        <button onClick={submitReview}>Save {meal.toLowerCase()} review</button>
      </section></>}
  </>;
}
