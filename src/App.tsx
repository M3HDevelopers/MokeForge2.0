import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#101114',
      color: '#e9e7e1',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#ff6b3d' }}>
        ✅ MockForge is Working!
      </h1>
      <p style={{ fontSize: '24px', marginBottom: '30px' }}>
        React is rendering properly
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#ff6b3d',
          color: '#1a0e08',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Count: {count}
      </button>
      <p style={{ fontSize: '16px', marginTop: '20px', opacity: 0.7 }}>
        If you can see this and click the button, React is working!
      </p>
    </div>
  );
}
