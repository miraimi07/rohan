self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // On cible seulement Spotify
  if (url.includes("open.spotify.com")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            return response.text().then(html => {
              // Injection CSS
              const customCSS = `
                <style>
                  .Root__now-playing-bar {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0;
                    right: 0;
                    height: 100px !important;
                    transform: scale(1.4);
                    z-index: 9999;
                  }
                  .track-info__name,
                  .track-info__artists {
                    display: none !important;
                  }
                  .player-controls {
                    justify-content: center !important;
                  }
                </style>
              `;
              const modified = html.replace("</head>", `${customCSS}</head>`);
              return new Response(modified, {
                headers: response.headers
              });
            });
          }
          return response;
        })
        .catch(() => fetch(event.request))
    );
  }
});
