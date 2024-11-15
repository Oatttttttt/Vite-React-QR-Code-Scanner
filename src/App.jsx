import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [scannedText, setScannedText] = useState(''); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const scannerConfig = { fps: 10, qrbox: 250 };
    const scanner = new Html5QrcodeScanner('reader', scannerConfig);

    const onSuccess = (decodedText) => {
      console.log(`QR Code scanned: ${decodedText}`);
      setScannedText(decodedText);
      setError(null);
    };

    const onError = (errorMessage) => {
      console.error(`QR Code error: ${errorMessage}`);
      setError('Failed to scan QR Code. Please try again.');
    };

    scanner.render(onSuccess, onError);

    return () => {
      scanner.clear().catch((clearError) => console.error(`Error clearing scanner: ${clearError}`));
    };
  }, []);

  return (
    <div className="app-container">
      <header>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1>Vite + React QR Code Scanner</h1>
      </header>

      <main>
        <div id="reader" className="qr-reader"></div>
        <div className="scanner-result">
          <h2>QR Code Value:</h2>
          <p>{scannedText || 'No QR Code scanned yet.'}</p>
          {error && <p className="error-message">{error}</p>}
        </div>
      </main>
    </div>
  );
}

export default App;
