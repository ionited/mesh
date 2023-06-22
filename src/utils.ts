export const parseQuery = (query: string) => query.split('&').reduce((data, q) => {
  const parts = q.split('=');

  data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);

  return data;
}, {} as { [key: string]: string });
