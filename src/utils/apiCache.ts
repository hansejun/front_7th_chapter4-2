import { AxiosResponse } from 'axios';

export const createCachedFunction = <T>(
  apiFunc: () => Promise<AxiosResponse<T>>,
) => {
  let cache: Promise<AxiosResponse<T>> | null = null;

  return (): Promise<AxiosResponse<T>> => {
    if (!cache) {
      cache = apiFunc();
    }
    return cache;
  };
};
