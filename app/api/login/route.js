import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import cookie from 'cookie';

const pool = new Pool({
  connectionString: 'postgresql://postgres.kgdxqxgmlfpwzelyamxv:_CPGJypV9RU$Nq-@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
});

export async function POST(req) {
  try {
    const { loginEmail, loginPassword } = await req.json(); // Make sure to parse the request body as JSON

    // Query the database for the user by email
    const query = "SELECT * FROM users WHERE email=$1";
    const userResponse = await pool.query(query, [loginEmail]);

    if (userResponse.rows.length > 0) {
      const user = userResponse.rows[0];

      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(loginPassword, user.password);

      if (passwordMatch) {
        // Create a JWT token with the user's details
        const token = jwt.sign(
          { 
            id: user.user_id,
            name: user.full_name, 
            email: user.email, 
            i_weight: user.initial_weight, 
            t_weight: user.target_weight, 
            c_weight: user.current_weight 
          },
          "abcdefghijklmnnop", // Store your JWT secret in environment variables for security
          { expiresIn: '1h' }
        );

        // Create a response and set the cookie
        const response = new NextResponse(JSON.stringify({ login: "allow" }), { status: 200 });

        response.headers.set(
          'Set-Cookie',
          cookie.serialize('authToken', token, {
            httpOnly: true,
            maxAge: 3600000, // 1 hour in seconds
            secure: true,
            sameSite: 'none', // Set to 'None' if using cross-site cookies
            path: '/' // Cookie is accessible from all paths
          })
        );

        return response;
      } else {
        return new NextResponse(JSON.stringify({ login: "Incorrect password" }), { status: 401 });
      }
    } else {
      return new NextResponse(JSON.stringify({ login: "User does not exist" }), { status: 404 });
    }
  } catch (error) {
    console.error('Database query error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
