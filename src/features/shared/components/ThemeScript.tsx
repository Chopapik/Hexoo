export default function ThemeScript() {
  const scriptContent = `
    (function() {
      try {
        var stored = localStorage.getItem('theme');
        if (stored === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          if (!stored) {
             localStorage.setItem('theme', 'dark');
          }
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: scriptContent,
      }}
    />
  );
}
