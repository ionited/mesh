export const getParts = (body: string, contentType: string) => {
  const boundary = contentType.split('=')[1];

  const
    parts: any = {},
    data = body.split(`--${boundary}`);

  data.shift();
  data.pop();
  
  for (let i = 0; i < data.length; i++) {
    const part = data[i].trim();

    const [h, b] = part.split('\r\n\r\n');

    const
      header = h.trim(),
      body = b.trim();

    const
      name = /name="([^"]+)"/.exec(header),
      filename = /filename="([^"]+)"/.exec(header),
      type = /Content-Type: ([^\r\n]+)/.exec(header);

    parts[name ? name[1] : ''] = filename && type ? { data: Buffer.from(body, 'binary'), filename: filename[1].trim(), type: type[1].trim() } : body;
  }
  
  return parts;
}

export const parseQuery = (query: string) => query.split('&').reduce((data, q) => {
  const parts = q.split('=');

  data[parts[0]] = parts[1];

  return data;
}, {} as { [key: string]: string });
