import { clerkClient } from '@/utils/clerkClient';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { GetServerSideProps } from 'next';
import React from 'react';

interface User {
  name: string;
  username: string;
}

const IndexPage = ({ user }: { user: User }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Welcome</h1>
        <div className="font-medium text-gray-800 mb-6">
          <p>Name: {user?.name}</p>
          <p>Mixcloud Username: {user?.username}</p>

        </div>
      </div>
    </div>
  );
};

export default IndexPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  const { mixcloud__session } = parse(cookies);

  if (!mixcloud__session) {
    return {
      redirect: {
        destination: '/auth/sign-in',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(mixcloud__session, process.env.NEXT_PUBLIC_JWT_SECRET as string) as User;

    if (!decoded && !decoded.userId) {
      return {
        redirect: {
          destination: '/auth/sign-in',
          permanent: false,
        },
      };
    }

    const user = await clerkClient.users.getUser(decoded?.userId);

    if (!user) {
      return {
        redirect: {
          destination: '/auth/sign-in',
          permanent: false,
        },
      };
    }

    return {
      props: {
        user: {
          name: user.firstName,
          username: user.username,
        },
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
