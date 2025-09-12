import { useEffect, useState } from 'react';

type Greeting = { message: string };

export function App() {
  const [health, setHealth] = useState<string>('checking...');
  const [greeting, setGreeting] = useState<Greeting | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j) => setHealth(j.ok ? 'ok' : 'error'))
      .catch(() => setHealth('error'));
  }, []);

  const askGreeting = async () => {
    const res = await fetch('/api/greeting?name=Hexoo');
    const json = (await res.json()) as Greeting;
    setGreeting(json);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Hexoo Client</h1>
      <p>
        API health: <strong>{health}</strong>
      </p>

      <button onClick={askGreeting} style={{ padding: '8px 12px' }}>
        Ask API for greeting
      </button>

      {greeting && (
        <p style={{ marginTop: 12 }}>
          API says: <strong>{greeting.message}</strong>
        </p>
      )}
    </div>
  );
}

