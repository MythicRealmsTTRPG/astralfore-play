export const onRequest: PagesFunction = async ({ request, env }) => {
  const url = new URL(request.url);

  // Rewrite to the dynamic template page
  url.pathname = "/campaigns/_/index.html";

  return env.ASSETS.fetch(new Request(url.toString(), request));
};
