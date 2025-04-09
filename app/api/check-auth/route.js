// app/api/check-auth/route.js
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.kgdxqxgmlfpwzelyamxv:_CPGJypV9RU$Nq-@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
});

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('authToken')?.value;

  console.log("Cookies:", cookieStore);

  if (!token) {
    console.log("No token provided");
    return NextResponse.json({ login: "You need to" });
  }

  try {
    const decoded = verify(token, "abcdefghijklmnnop");
    const userID = decoded.id;

    const query = `
      SELECT birthday, sex, goal_cals, goal_protein, goal_fats, goal_carbs 
      FROM users 
      WHERE user_id = $1
    `;

    const { rows } = await pool.query(query, [userID]);

    if (rows.length === 0) {
      return NextResponse.json({ login: "No", message: "User not found" });
    }

    const { goal_cals, goal_protein, goal_fats, goal_carbs, birthday, sex } = rows[0];

    return NextResponse.json({
      login: "Yes",
      id: userID,
      name: decoded.name,
      iweight: decoded.i_weight,
      tweight: decoded.t_weight,
      cweight: decoded.c_weight,
      goal_cals,
      goal_protein,
      goal_fats,
      goal_carbs,
      birthday,
      sex,
    });

  } catch (err) {
    console.log("Invalid token", err);
    return NextResponse.json({ login: "No" });
  }
}
