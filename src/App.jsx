import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [scannedText, setScannedText] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [parsedData, setParsedData] = useState([]);
  const [cameraFacingMode, setCameraFacingMode] = useState("");

  useEffect(() => {
    if (!isScanning) return;
    const videoConstraints = {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      facingMode: "environment",
    };
    const scannerConfig = {
      fps: 30,
      qrbox: 250,
      videoConstraints,
    };
    const scanner = new Html5QrcodeScanner("reader", scannerConfig);

    const onSuccess = (decodedText) => {
      console.log(`QR Code scanned: ${decodedText}`);
      setScannedText(decodedText);
      setParsedData(parseTLV(decodedText));
      setIsScanning(false);
      scanner
        .clear()
        .catch((clearError) =>
          console.error(`Error clearing scanner: ${clearError}`)
        );
    };

    const onError = (errorMessage) => {
      console.error(`QR Code error: ${errorMessage}`);
    };

    scanner.render(onSuccess, onError);

    return () => {
      scanner
        .clear()
        .catch((clearError) =>
          console.error(`Error clearing scanner: ${clearError}`)
        );
    };
  }, [isScanning]);

  useEffect(() => {
    checkCameraFacingMode();
  }, []);

  const handleRescan = () => {
    setScannedText("");
    setParsedData([]);
    setIsScanning(true);
  };

  const parseTLV = (payload) => {
    const data = [];
    let i = 0;
  
    while (i < payload.length) {
      const tag = payload.substring(i, i + 2);
      const length = parseInt(payload.substring(i + 2, i + 4), 10);
      const value = payload.substring(i + 4, i + 4 + length);
      if (tag === "30") {
        const subData = [];
        let j = 0;
  
        while (j < value.length) {
          const subTag = value.substring(j, j + 2);
          const subLength = parseInt(value.substring(j + 2, j + 4), 10);
          const subValue = value.substring(j + 4, j + 4 + subLength);
          const ref1 = "";
          if(subTag==="02"){
              ref1 == subValue;
          }
          subData.push({ subTag, subValue });
          j += 4 + subLength;
        }
  
        data.push({ tag, subData });
      } else {
        data.push({ tag, value });
      }
      i += 4 + length;
    }
  
    return data;
  };
  
  const applyVideoMirrorEffect = () => {
    const checkVideoElement = () => {
      const videoElement = document.querySelector("#reader__scan_region video");
      if (videoElement) {
        videoElement.style.transform = "scaleX(-1)";
      } else {
        setTimeout(checkVideoElement, 100);
      }
    };
    checkVideoElement();
  };
  
  const checkCameraFacingMode = async () => {    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    console.log("check mode --> " + settings.facingMode);
    if (settings.facingMode === "user") {
      applyVideoMirrorEffect();
    }
    setCameraFacingMode(settings.facingMode);
    track.stop();  
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
      <h2 className="result-header">Camera Facing Mode: {cameraFacingMode}</h2>
      <h2 className="result-header">QR Code Value:</h2>
      <p className="result-text">
        {scannedText || "No QR Code scanned yet."}
      </p>
      <h3 className="parsed-header">Parsed Data:</h3>
      <ul className="parsed-list">
        {parsedData.map(({ tag, value, subData }, index) => (
          <li key={index} className="parsed-item">
            <strong>Tag:</strong> {tag}, <strong>Value:</strong> {value}
            {tag === "30" && subData && (
              <ul className="subdata-list">
                {subData.map(({ subTag, subValue }, subIndex) => (
                  <li key={subIndex} className="subdata-item">
                    <strong>Sub Tag:</strong> {subTag},{" "}
                    <strong>Sub Value:</strong> {subValue}
                  </li>
                ))}
              </ul>
            )}
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
