interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

interface SearchResponse {
  results?: BraveSearchResult[];
  query?: string;
  error?: string;
}

export async function webSearch(query: string, apiKey: string, count = 5): Promise<SearchResponse> {
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&lang=fr&country=fr`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!res.ok) {
      return { error: `Erreur Brave Search: ${res.status} ${res.statusText}`, query };
    }

    const data = await res.json();
    const results: BraveSearchResult[] = (data.web?.results || []).slice(0, count).map(
      (r: { title: string; url: string; description: string; age?: string }) => ({
        title: r.title,
        url: r.url,
        description: r.description,
        age: r.age,
      })
    );

    return { results, query };
  } catch (err) {
    return { error: String(err), query };
  }
}
