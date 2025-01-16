import { axiosInstance } from './axiosInstance';

type Fetcher<T> = (url: string) => Promise<T>;

const fetcher = (url: any, token?: string) =>
  axiosInstance
    .get(url, {
      headers: {
        Authorization: `Bearer ${
          token
            ? token
            : typeof window !== 'undefined'
              ? localStorage.getItem('access_token')
              : null
        }`,
      },
    })
    .then((res) => res.data);

export default fetcher;
