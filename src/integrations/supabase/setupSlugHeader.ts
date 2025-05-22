
/**
 * Configura un interceptor per aggiungere l'header x-slug a tutte le richieste Supabase
 * utilizzando il valore memorizzato in localStorage
 */
export function setupSlugHeader() {
  const slug = localStorage.getItem('user_slug');
  
  if (!slug) return;
  
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.includes('supabase.co')) {
      init = init || {};
      init.headers = init.headers || {};
      Object.assign(init.headers, { 'x-slug': slug });
    }
    return originalFetch(input, init);
  };
}
