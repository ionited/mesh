export const parseQuery = (query: string) => query.split('&').reduce((data, q) => {
  const parts = q.split('=');
  const key = decodeURIComponent(parts[0]);
  const value = decodeURIComponent(parts[1]);

  if (key.endsWith('[]')) {
    const normalizedKey = key.slice(0, -2); // Remove the '[]' suffix
    if (!Array.isArray(data[normalizedKey])) {
      data[normalizedKey] = [];
    }
    (data[normalizedKey] as string[]).push(value);
  } else {
    data[key] = value;
  }

  return data;
}, {} as { [key: string]: string | string[] });
