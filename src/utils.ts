export const parseQuery = (query: string) => {
  const data: { [key: string]: string | string[] | { [key: string]: string } } = {};

  // Split the query string by '&' to get individual key-value pairs
  const keyValuePairs = query.split('&');

  keyValuePairs.forEach((pair) => {
    const [fullKey, value] = pair.split('=');

    // Use regex to match keys with square brackets and extract the key and index
    const keyMatches = fullKey.match(/([^&\[\]]+)(\[([^\[\]]+)\])?/);

    if (keyMatches) {
      const key = decodeURIComponent(keyMatches[1]);
      const index = keyMatches[3] ? decodeURIComponent(keyMatches[3]) : undefined;

      if (index !== undefined) {
        if (!data[key]) {
          data[key] = {};
        }

        // If an index is provided, set the value at that index in the nested object
        (data[key] as { [key: string]: string })[index] = decodeURIComponent(value);
      } else if (keyMatches[2] === '[]') {
        // If the key ends with '[]', treat it as an array
        if (!Array.isArray(data[key])) {
          data[key] = [];
        }
        (data[key] as string[]).push(decodeURIComponent(value));
      } else {
        // If no index is provided and key doesn't end with '[]', set the value directly
        if (data[key] === undefined) {
          data[key] = decodeURIComponent(value);
        } else {
          // If the key already exists and is not an array, convert it to an array
          if (!Array.isArray(data[key])) {
            data[key] = [data[key] as string];
          }
          (data[key] as string[]).push(decodeURIComponent(value));
        }
      }
    }
  });

  return data;
};
