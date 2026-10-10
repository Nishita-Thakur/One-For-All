import { useState } from 'react';
import { MEALS, DAYS } from '../lib/constants';
import { todayDow } from '../lib/utils';
import MealCard from '../components/MealCard';
import MessPicker from '../components/MessPicker';

export default function MenuScreen({ messes, messId, setMessId, mess, menu, setScreen }) {
  const [day, setDay] = useState(todayDow());
  const by = (d, m) => menu.filter(i => i.day_of_week === d && i.meal === m);
  return <>
    <header className="app-head compact"><div><h1>{mess?.name} menu</h1><p>Today is {DAYS[todayDow() - 1]}.</p></div><MessPicker {...{ messes, messId, setMessId }} /></header>
    <div className="two-col">
      <section><h2 className="col-title">Today's menu</h2><div className="stack">{MEALS.map(m => <MealCard key={m} meal={m} items={by(todayDow(), m)} />)}</div>
        <button className="full" onClick={() => setScreen('rate')}>Rate today's food</button></section>
      <section><h2 className="col-title">This week</h2>
        <div className="request-tabs">{DAYS.map((d, i) => <button key={d} className={day === i + 1 ? 'active' : ''} onClick={() => setDay(i + 1)}>{d.slice(0, 3)}</button>)}</div>
        <div className="stack">{MEALS.map(m => <MealCard key={m} meal={m} items={by(day, m)} />)}</div></section>
    </div>
  </>;
}
