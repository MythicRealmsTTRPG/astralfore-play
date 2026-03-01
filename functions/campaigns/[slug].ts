export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  url.pathname = "/campaigns/_/index.html";
  return fetch(new Request(url.toString(), request));
};
