import './App.css';
import { InputBar } from './components/InputBar';
import { Dashboard } from './components/Dashboard';
import React from 'react';
import { Feature, get_feature_sample } from './dataset';


function App() {

  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [offset, setOffset] = React.useState(1000);
  const [length, setLength] = React.useState(10);
  const [probeLayer, setProbeLayer] = React.useState(16);
  const [loading, setLoading] = React.useState(true);
  const [layer, setLayer] = React.useState(6);
  const [alpha, setAlpha] = React.useState(0.5);
  const [requiredScale, setRequiredScale] = React.useState(10.0);

  React.useEffect(() => {

    console.log("Fetching data");

    setLoading(true);
    
    get_feature_sample(layer, offset, length, probeLayer, alpha, requiredScale).then((res) => {
      setFeatures(res);
      setLoading(false);
    });
  }, [layer, offset, length, probeLayer, alpha, requiredScale]);

  return (
    <div className="App">
      <header className="App-header">
        <InputBar
          setOffset={setOffset}
          setLength={setLength}
          setProbeLayer={setProbeLayer}
          setLayer={setLayer}
          setAlpha={setAlpha}
          setRequiredScale={setRequiredScale}
          offset={offset}
          length={length}
          probeLayer={probeLayer}
          layer={layer}
          alpha={alpha}
          requiredScale={requiredScale}
        />
        {loading ? <p>Loading...</p> : <Dashboard features={features} />}
        {/* <Dashboard features={features} /> */}
      </header>
    </div>
  );
}

export default App;
