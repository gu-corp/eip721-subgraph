import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createSubgraphClient } from '@gu-corp/eip721-subgraph-client';

export interface EIP721ProviderConfig {
  /** Subgraph endpoint URL */
  url: string;
}

interface EIP721ContextValue {
  client: ReturnType<typeof createSubgraphClient>;
}

const EIP721Context = createContext<EIP721ContextValue | null>(null);

export interface EIP721ProviderProps {
  config: EIP721ProviderConfig;
  children: ReactNode;
}

export function EIP721Provider({ config, children }: EIP721ProviderProps) {
  const value = useMemo(() => {
    const client = createSubgraphClient({ url: config.url });
    return { client };
  }, [config.url]);

  return <EIP721Context.Provider value={value}>{children}</EIP721Context.Provider>;
}

export function useEIP721Context(): EIP721ContextValue {
  const context = useContext(EIP721Context);
  if (!context) {
    throw new Error('useEIP721Context must be used within an EIP721Provider');
  }
  return context;
}
