# 🍽️ Mess Rater

Rate hostel mess food, review meals, and send suggestions or complaints to the mess admin.

**Status:** 🚧 In Development · Stack: React + Vite + Supabase (same as Roommate Finder)

## Setup
1. In your Supabase project (the one Roommate Finder uses) open **SQL Editor** and run, in order:
   `supabase/schema.sql`, then `supabase/seed.sql` (Dhriti/Pavani Hall weekly menu).
2. Make yourself an admin (after signing up once in the app):
   `insert into admins select id from auth.users where email = 'you@thapar.edu';`
3. `cd mess-rater-frontend`, copy `.env.example` to `.env`, paste the same Supabase URL and anon key as Roommate Finder.
4. `npm install` then `npm run dev` (runs on http://localhost:5174).

## Adding another mess
`insert into messes (name, hostels) values ('Hostel H mess', '{"Hostel H"}');`
then, as admin, copy a menu: `select admin_clone_menu('<from id>', '<to id>');` and edit `menu_items` rows as needed.

## How it works
| Screen | What it does |
|---|---|
| Overview | Intro, how it works, mess cards with 30-day scores |
| Menu | Today's menu plus any day of the week |
| Rate today | Star each dish, then score the meal on food quality, taste & variety, hygiene |
| Suggestions | Send a suggestion or complaint, track its status |
| Admin panel | Performance table, lowest-rated dishes, suggestions, complaints (status + note), action log |

Rules enforced in the database (not just the UI): one rating per dish per student per day, only today's menu can be rated,
students only see their own submissions, only admins can read everyone's or change statuses.

## Code structure (`mess-rater-frontend/src`)
`main.jsx` starts the app, `App.jsx` holds login state and navigation. `screens/` has one file per page (Auth, Home, MenuScreen, Rate, Suggest, Admin),
`components/` has the shared pieces (TopBar, Stars, Field, MessPicker, MealCard, Empty), and `lib/` has the Supabase client, constants, date helpers and theme.
