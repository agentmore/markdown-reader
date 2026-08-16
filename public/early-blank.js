(() => {
  const markdownPath = /\.(?:md|markdown)$/i.test(location.pathname);
  const contentType = document.contentType.toLowerCase().split(';', 1)[0].trim();
  const rawMarkdown = [
    'text/markdown',
    'text/plain',
    'text/x-markdown',
    'application/markdown',
    'application/x-markdown',
  ].includes(contentType);

  if (!markdownPath || !rawMarkdown) return;

  const root = document.documentElement;
  root.style.setProperty('visibility', 'hidden', 'important');
  root.style.setProperty(
    'background-color',
    matchMedia('(prefers-color-scheme: dark)').matches ? '#0d1117' : '#ffffff',
    'important',
  );
})();
