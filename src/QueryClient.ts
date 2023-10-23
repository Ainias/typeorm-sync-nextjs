import { QueryClient } from '@tanstack/react-query';
import React from 'react';

export const client = new QueryClient();

// undefined is needed or else useQuery will throw a ts-error
export const queryContext = React.createContext<QueryClient | undefined>(client);
