import { getAccessToken, getUserData } from '@/utils/mixcloudHelper';
import type { NextApiRequest, NextApiResponse } from 'next';
import { clerkClient } from '@/utils/clerkClient';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { code },
  } = req;
  if (!code){
    console.log("mixcloud auth callback failed early - no code obj")
    return;
  }
  else {
    console.dir(code)
  }
  try {
    const { access_token } = await getAccessToken(code as string);

    const mixUser = await getUserData(access_token);

    const {
      key,
      name,
      username,
      pictures: { medium_mobile },
    } = mixUser;

    const externalId = `mixcloud:${mixUser.key}`;

    // 🔍 Check if user already exists
    const existingUsers = await clerkClient.users.getUserList({
      externalId: [externalId],
      limit: 1,
    });

    let user;

    if (existingUsers.data.length > 0) {
      user = existingUsers.data[0];
    } else {
      // 👤 Create new user
      // Ensure username is unique by appending a random string
      const uniqueUsername = `${username}_${Math.random().toString(36).substring(2, 7)}`;
      
      try {
        // Generate a secure random password
        const randomPassword = Math.random().toString(36).slice(2) +
                              Math.random().toString(36).toUpperCase().slice(2) +
                              '!@#$%^&*()_+';
        
        user = await clerkClient.users.createUser({
          externalId,
          firstName: name,
          username: uniqueUsername,
          emailAddress: [`${uniqueUsername}@example.com`], // Clerk requires an email address
          password: randomPassword, // Add password as required by Clerk
          publicMetadata: {
            mixcloud: {
              username,
              key,
              profileImageUrl: medium_mobile,
            },
          },
        });
      } catch (createError: any) {
        console.error('Error creating user:', createError);
        if (createError.errors) {
          console.error('Clerk validation errors:', createError.errors);
        }
        throw createError; // Re-throw to be caught by the outer catch block
      }
    }

    // 🔐 Generate sign-in token (7 days)
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        name: user.firstName,
        expiresInSeconds: 60 * 60 * 24 * 7,
      },
      process.env.NEXT_PUBLIC_JWT_SECRET as string,
      {
        expiresIn: '7d', // expires in 7 days
      }
    );
    // Set session cookie
    res.setHeader(
      'Set-Cookie',
      [
        `mixcloud__session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
        `mixcloud__access_token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}` // 7 days
      ]
    );

    res.redirect(`/`);
  } catch (error: any) {
    console.error('Error fetching access token or user data:', error);
    
    // Log detailed error information for Clerk errors
    if (error && error.clerkError) {
      console.error('Clerk Error Details:', {
        status: error.status,
        clerkTraceId: error.clerkTraceId,
        errors: error.errors
      });
    }
    
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
