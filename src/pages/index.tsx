import { clerkClient } from '@/utils/clerkClient';
import { MixcloudTrack, getUserFavorites } from '@/utils/mixcloudHelper';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { GetServerSideProps } from 'next';
import React from 'react';
import Image from 'next/image';

interface User {
  name: string;
  username: string;
  accessToken?: string;
}

interface IndexPageProps {
  user: User;
  favorites: MixcloudTrack[];
}

const IndexPage = ({ user, favorites }: IndexPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Welcome, {user?.name}</h1>
          <p className="text-gray-600">Mixcloud Username: {user?.username}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Liked Tracks</h2>
          
          {favorites.length === 0 ? (
            <p className="text-gray-600 text-center py-8">You haven't liked any tracks yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((track) => (
                <div key={track.key} className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 relative flex-shrink-0">
                    <Image
                      src={track.pictures.medium_mobile}
                      alt={track.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="font-medium text-gray-800 line-clamp-1">{track.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">by {track.user.name}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span className="mr-3">
                        {Math.floor(track.audio_length / 60)}:{(track.audio_length % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="mr-3">
                        {track.play_count.toLocaleString()} plays
                      </span>
                      <span>
                        {track.favorite_count.toLocaleString()} likes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  const parsedCookies = parse(cookies);
  const mixcloud__session = parsedCookies.mixcloud__session;
  const mixcloud__access_token = parsedCookies.mixcloud__access_token;

  if (!mixcloud__session) {
    return {
      redirect: {
        destination: '/auth/sign-in',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(
      mixcloud__session,
      process.env.NEXT_PUBLIC_JWT_SECRET as string
    ) as { userId: string; username: string; name: string };

    if (!decoded || !decoded.userId) {
      console.error('Invalid token data:', decoded);
      return {
        redirect: {
          destination: '/auth/sign-in',
          permanent: false,
        },
      };
    }

    // Try to get user from Clerk, but use token data as fallback
    let user;
    try {
      user = await clerkClient.users.getUser(decoded.userId);
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      // Use token data as fallback
      user = {
        id: decoded.userId,
        firstName: decoded.name,
        username: decoded.username
      };
    }

    if (!user) {
      return {
        redirect: {
          destination: '/auth/sign-in',
          permanent: false,
        },
      };
    }

    // Fetch user's favorites if we have an access token
    let favorites: MixcloudTrack[] = [];
    if (mixcloud__access_token) {
      try {
        const username = user.username || decoded.username;
        const favoritesData = await getUserFavorites(mixcloud__access_token, username);
        favorites = favoritesData.data || [];
      } catch (error) {
        console.error('Error fetching favorites:', error);
        // Continue even if favorites fetch fails
      }
    }
    else {
      console.log("no mixcloud access token, skipping fav track lookup")
    }

    return {
      props: {
        user: {
          name: user.firstName || decoded.name,
          username: user.username || decoded.username,
          accessToken: mixcloud__access_token || null,
        },
        favorites: favorites,
      },
    };
  } catch (err) {
    console.error('Token verification failed:', err);
    return {
      redirect: {
        destination: '/auth/sign-in',
        permanent: false,
      },
    };
  }
};
