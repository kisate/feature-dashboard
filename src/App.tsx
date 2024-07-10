import './App.css';
import { InputBar } from './components/InputBar';
import { Dashboard } from './components/Dashboard';
import React from 'react';
import { Feature, get_feature_sample, get_feature } from './dataset';
import { Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App() {
  const query = useQuery();

  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [offset, setOffset] = React.useState(Number(query.get('offset')) || 1000);
  const [length, setLength] = React.useState(Number(query.get('length')) || 10);
  const [probeLayer, setProbeLayer] = React.useState(Number(query.get('probeLayer')) || 16);
  const [loading, setLoading] = React.useState(true);
  const [layer, setLayer] = React.useState(Number(query.get('layer')) || 6);
  const [alpha, setAlpha] = React.useState(Number(query.get('alpha')) || 0.4);
  const [requiredScale, setRequiredScale] = React.useState(Number(query.get('requiredScale')) || 10.0);
  const [targetFeature, setTargetFeature] = React.useState<number | null>(query.get('targetFeature') ? Number(query.get('targetFeature')) : null);
  const [oldTargetFeature, setOldTargetFeature] = React.useState<number | null>(null);

  const updateUrl = () => {
    const params = new URLSearchParams();
    params.set('offset', String(offset));
    params.set('length', String(length));
    params.set('probeLayer', String(probeLayer));
    params.set('layer', String(layer));
    params.set('alpha', String(alpha));
    params.set('requiredScale', String(requiredScale));
    if (targetFeature !== null) {
      params.set('targetFeature', String(targetFeature));
    }
  };

  React.useEffect(() => {
    updateUrl();
  }, [offset, length, probeLayer, layer, alpha, requiredScale, targetFeature]);

  const handleNextPage = () => {
    setOffset(prevOffset => prevOffset + length);
  };

  const handlePreviousPage = () => {
    setOffset(prevOffset => prevOffset - length);
  };

  React.useEffect(() => {
    console.log("Fetching data");
    console.log(offset);

    setLoading(true);

    if (targetFeature !== null) {
      if (oldTargetFeature !== targetFeature) {
        get_feature(layer, probeLayer, alpha, requiredScale, targetFeature).then((res) => {
          setFeatures(res);
          setLoading(false);
          setOldTargetFeature(targetFeature);
        });
        return;
      }
    }
    
    get_feature_sample(layer, offset, length, probeLayer, alpha, requiredScale).then((res) => {
      setFeatures(res);
      setLoading(false);
    });
  }, [layer, offset, length, probeLayer, alpha, requiredScale, targetFeature]);

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
          targetFeature={targetFeature}
          offset={offset}
          length={length}
          probeLayer={probeLayer}
          layer={layer}
          alpha={alpha}
          requiredScale={requiredScale}
          setTargetFeature={setTargetFeature}
        />
        {loading ? <p>Loading...</p> : <Dashboard features={features} />}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {
            offset - length >= 0 && <Button variant="outlined" onClick={handlePreviousPage}>Previous Page</Button>
          }
          <Button variant="outlined" onClick={handleNextPage}>Next Page</Button>
        </div>
      </header>
    </div>
  );
}

export default App;
