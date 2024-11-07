export const wm = (url: string) => {
  return fetch('https://chrome-api.archive.org/save', {
    method: 'POST',
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'capture_all': '1',
      url
    }),
  }).then((r) => r.json())
    .catch((e) => {
      console.error('Error archiving: ', url)
      console.error(e)
    })
}
