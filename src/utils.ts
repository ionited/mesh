export const parseQuery = (query: string) => query.split('&').reduce((data, q) => {
  const parts = q.split('=');

  data[parts[0]] = parts[1];

  return data;
}, {} as { [key: string]: string });
