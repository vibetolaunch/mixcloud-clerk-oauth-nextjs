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
  if (!code) return;

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
      user = await clerkClient.users.createUser({
        externalId,
        firstName: name,
        username,
        publicMetadata: {
          mixcloud: {
            username,
            key,
            profileImageUrl: medium_mobile,
          },
        },
      });
    }

    // 🔐 Generate sign-in token (7 days)
    const token = jwt.sign(
      {
        userId: user.id,
        expiresInSeconds: 60 * 60 * 24 * 7,
      },
      process.env.NEXT_PUBLIC_JWT_SECRET as string,
      {
        expiresIn: '7d', // expires in 7 days
      }
    );

    res.setHeader(
      'Set-Cookie',
      `mixcloud__session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    res.redirect(`/`);
  } catch (error) {
    console.error('Error fetching access token or user data:', error);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
