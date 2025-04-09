import { NextResponse } from 'next/server';
import cookie from 'cookie';
export async function POST() {
  const response = NextResponse.json({ message: 'Cookie Removed' });
  response.headers.set(
    'Set-Cookie',
    cookie.serialize('authToken', '', {
      httpOnly: true,
      maxAge: 0, // 1 hour in seconds
      secure: true,
      sameSite: 'none', // Set to 'None' if using cross-site cookies
      path: '/' // Cookie is accessible from all paths
    })
  );
  return response;
}