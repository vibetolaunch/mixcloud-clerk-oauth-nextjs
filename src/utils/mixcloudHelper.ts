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
  else {
    console.log("getAccessToken call to mixcloud auth successful")
    console.dir(res.json())
  }
  return res.json();
};

export const getUserData = async (accessToken: string) => {
  const res = await fetch(`${BASE_URL}/me/?access_token=${accessToken}`);
  if (!res.ok) throw new Error('Failed to fetch user data');
  return res.json();
};

// Interface for Mixcloud track data
export interface MixcloudTrack {
  key: string;
  name: string;
  url: string;
  pictures: {
    medium: string;
    "320wx320h": string;
    extra_large: string;
    large: string;
    medium_mobile: string;
    small: string;
    thumbnail: string;
  };
  user: {
    name: string;
    username: string;
    key: string;
    pictures: {
      medium: string;
      "320wx320h": string;
      extra_large: string;
      large: string;
      medium_mobile: string;
      small: string;
      thumbnail: string;
    };
  };
  created_time: string;
  audio_length: number;
  play_count: number;
  favorite_count: number;
  comment_count: number;
}

// Interface for Mixcloud API response
export interface MixcloudApiResponse {
  data: MixcloudTrack[];
  paging: {
    next: string | null;
    previous: string | null;
  };
}

// Get user's favorite tracks
export const getUserFavorites = async (
  accessToken: string,
  username: string,
  limit: number = 20
): Promise<MixcloudApiResponse> => {
  const res = await fetch(
    `${BASE_URL}/${username}/favorites/?access_token=${accessToken}&limit=${limit}`
  );
  console.log(`${BASE_URL}/${username}/favorites/?access_token=${accessToken}&limit=${limit}`)
  console.dir(res.json())
  if (!res.ok) throw new Error('Failed to fetch user favorites');
  return res.json();
};
