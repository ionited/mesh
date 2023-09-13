export const parseQuery = (query: string) => {
  const
    result: any = {},
    parts = query.split('&');

  parts.forEach(p => {
    const
      [k, v] = p.split('='),
      dkey = decodeURIComponent(k),
      key = dkey.slice(-2) === '[]' ? dkey.slice(0, -2) : dkey,
      val = decodeURIComponent(v);

    if (result[key] === undefined) result[key] = val;
    else if (Array.isArray(result[key])) result[key].push(val);
    else result[key] = [result[key], val];
  });

  return result;
}
