// Project: mixcloud-auth
const CLIENT_SECRET = process.env.NEXT_PUBLIC_MIXCLOUD_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_MIXCLOUD_REDIRECT_URI;
const CLIENT_ID = process.env.NEXT_PUBLIC_MIXCLOUD_CLIENT_ID;

// Mixcloud API URLs
const OAuth_URL = 'https://www.mixcloud.com/oauth';
const BASE_URL = 'https://api.mixcloud.com';

export const mixcloudAuthUrl = `${OAuth_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

export const getAccessToken = async (code: string) => {
  const res = await fetch(
    `${OAuth_URL}/access_token?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${CLIENT_SECRET}&code=${code}`,
    {
      method: 'POST',
    }
  );

  if (!res.ok) throw new Error('Failed to fetch access token');
  return res.json();
};

export const getUserData = async (accessToken: string) => {
  const res = await fetch(`${BASE_URL}/me/?access_token=${accessToken}`);
  if (!res.ok) throw new Error('Failed to fetch user data');
  return res.json();
};
