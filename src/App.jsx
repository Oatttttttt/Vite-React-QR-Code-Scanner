import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [scannedText, setScannedText] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [parsedData, setParsedData] = useState([]); // เก็บผลลัพธ์ที่แยกค่า

  useEffect(() => {
    if (!isScanning) return;

    const scannerConfig = { fps: 10, qrbox: 250 };
    const scanner = new Html5QrcodeScanner('reader', scannerConfig);

    const onSuccess = (decodedText) => {
      console.log(`QR Code scanned: ${decodedText}`);
      setScannedText(decodedText);
      setParsedData(parseTLV(decodedText)); // แยกค่าและเก็บผลลัพธ์
      setIsScanning(false);
      scanner.clear().catch((clearError) =>
        console.error(`Error clearing scanner: ${clearError}`)
      );
    };

    const onError = (errorMessage) => {
      console.error(`QR Code error: ${errorMessage}`);
    };

    scanner.render(onSuccess, onError);

    return () => {
      scanner.clear().catch((clearError) => console.error(`Error clearing scanner: ${clearError}`));
    };
  }, [isScanning]);

  const handleRescan = () => {
    setScannedText('');
    setParsedData([]);
    setIsScanning(true);
  };

  // ฟังก์ชันแยกค่า Tag-Length-Value
  const parseTLV = (payload) => {
    const data = [];
    let i = 0;

    while (i < payload.length) {
      const tag = payload.substring(i, i + 2); // อ่าน Tag 2 หลัก
      const length = parseInt(payload.substring(i + 2, i + 4), 10); // อ่าน Length 2 หลัก
      const value = payload.substring(i + 4, i + 4 + length); // อ่าน Value ตาม Length
      data.push({ tag, value }); // เก็บ Tag และ Value ในรูปแบบ Object
      i += 4 + length; // ขยับไปยังฟิลด์ถัดไป
    }

    return data; // ส่งผลลัพธ์กลับ
  };

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
        {isScanning ? (
          <div id="reader" className="qr-reader"></div>
        ) : (
          <div className="scanner-result">
            <h2>QR Code Value:</h2>
            <p>{scannedText || 'No QR Code scanned yet.'}</p>
            <h3>Parsed Data:</h3>
            <ul>
              {parsedData.map(({ tag, value }, index) => (
                <li key={index}>
                  <strong>Tag:</strong> {tag}, <strong>Value:</strong> {value}
                </li>
              ))}
            </ul>
            <button onClick={handleRescan} className="rescan-button">
              Scan Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
