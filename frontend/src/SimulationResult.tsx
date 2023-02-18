import React from 'react';
import useSWR from 'swr';
import { fetchSimulationResult } from './fetcher/titleFetcher';

const SimulationResult = () => {
  const { data: simulationResult, isLoading } = useSWR(
    '/simulation',
    fetchSimulationResult
  );
  return <p>{isLoading ? 'isLoading...' : simulationResult}</p>;
};

export default SimulationResult;
