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

  React.useEffect(() => {

    console.log("Fetching data");

    setLoading(true);
    
    get_feature_sample(offset, length, probeLayer).then((res) => {
      setFeatures(res);
      setLoading(false);
    });
  }, [offset, length, probeLayer]);

  return (
    <div className="App">
      <header className="App-header">
        <InputBar
          setOffset={(offset: number) => setOffset(offset)}
          setLength={setLength}
          setProbeLayer={setProbeLayer}
          offset={offset}
          length={length}
          probeLayer={probeLayer}
        />
        {loading ? <p>Loading...</p> : <Dashboard features={features} />}
        {/* <Dashboard features={features} /> */}
      </header>
    </div>
  );
}

export default App;
