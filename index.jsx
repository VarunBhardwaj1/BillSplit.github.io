// index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => (
  <div>
    <h1>Bill Split</h1>
    <p>Welcome to the React app!</p>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
