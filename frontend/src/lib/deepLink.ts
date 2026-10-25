// Scaffold-owned (deep_links): the app routes on the hash, so a link that arrives on a plain path (a Stripe or
// Google return, a shared link) is moved into the hash before the router starts. The preview proxy prefix stays.
const PROXY_RE = /^(.*\/preview\/proxy)(\/.*)?$/;
const FILE_RE = /\.[A-Za-z0-9]+$/;
export function hashTarget(pathname: string, search: string, hash: string): string | null {
  const m = pathname.match(PROXY_RE);
  const base = m ? m[1] : '';
  const rest = m ? m[2] || '/' : pathname;
  if (rest === '/' || rest === '' || FILE_RE.test(rest) || hash.startsWith('#/')) return null;
  return base + '/#' + rest + search + hash;
}
const target = hashTarget(window.location.pathname, window.location.search, window.location.hash);
if (target) window.history.replaceState(null, '', target);
