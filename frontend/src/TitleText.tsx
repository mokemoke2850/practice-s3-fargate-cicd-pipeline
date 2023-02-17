import React from 'react';
import { fetchTitle } from './fetcher/titleFetcher';
import useSWR from 'swr';

const TitleText = () => {
  const { data: title, isLoading } = useSWR('/title', fetchTitle);
  return <p>{isLoading ? 'isLoading...' : title}</p>;
};

export default TitleText;
