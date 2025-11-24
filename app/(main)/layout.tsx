"use server";

import React, { ReactNode } from 'react';
import { checkUser } from '@/lib/checkUser';
import MainLayoutClient from './MainLayoutClient';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = async ({ children }: MainLayoutProps) => {
  await checkUser();

  return <MainLayoutClient>{children}</MainLayoutClient>;
};

export default MainLayout;