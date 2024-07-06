import './App.css';
import { InputBar } from './components/InputBar';
import { Dashboard } from './components/Dashboard';
import React from 'react';
import { Feature, get_feature_sample, get_feature } from './dataset';
import { Button } from '@mui/material';

const featureList = [
  9190, 15764, 12123, 9676, 16340, 8148, 7716, 9271, 14441, 9933, 8912, 11866, 6882, 961, 2710, 8145, 11291, 6602, 4375, 13891, 4462, 319, 13776, 7088, 2646, 12961, 6365, 4562, 5181, 2754, 14291, 2063, 2845, 10503, 15898, 2236, 9024, 14782, 3700, 3528, 13042, 5232, 16290, 3499, 16151, 16366, 531, 8165, 8399, 11223, 5798, 4106, 8323, 10917, 670, 14412, 443, 6357, 14771, 1247, 2299, 8049, 5620, 4580, 1321, 1706, 15760, 12945, 5459, 4074, 1234, 10739, 391, 3104, 5345, 9562, 7284, 7397, 14299, 13321, 9417, 4793, 5688, 11818, 4981, 6849, 6529, 9486, 8313, 8884, 3980, 2412, 15791, 15444, 3175, 14054, 10491, 10707, 14089, 11408
]


function App() {

  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [offset, setOffset] = React.useState(1000);
  const [length, setLength] = React.useState(10);
  const [probeLayer, setProbeLayer] = React.useState(16);
  const [loading, setLoading] = React.useState(true);
  const [layer, setLayer] = React.useState(6);
  const [alpha, setAlpha] = React.useState(0.4);
  const [requiredScale, setRequiredScale] = React.useState(10.0);
  const [targetFeature, setTargetFeature] = React.useState<number | null>(null);
  const [oldTargetFeature, setOldTargetFeature] = React.useState<number | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [ratings, setRatings] = React.useState<number[]>([]);

  const handleNextPage = () => {
    setOffset(prevOffset => prevOffset + length);
  };

  const handlePreviousPage = () => {
    setOffset(prevOffset => prevOffset - length);
  }

  const handleNextFeature = () => {
    setTargetFeature(featureList[currentStep + 1]);
    setCurrentStep(prevStep => prevStep + 1);
  }

  const handleRating = (rating: number) => {
    setRatings(prevRatings => [...prevRatings, rating]);
    console.log(ratings);
    handleNextFeature();
  }

  React.useEffect(() => {

    console.log("Fetching data");
    console.log(offset)

    setLoading(true);

    if (targetFeature === null) {
      setTargetFeature(featureList[currentStep]);
      return;
    }

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
        {/* <Dashboard features={features} /> */}

        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {/* {
            offset - length >= 0 && <Button variant="outlined" onClick={handlePreviousPage}>Previous Page</Button>
          }
          <Button variant="outlined" onClick={handleNextPage}>Next Page</Button> */}
          <Button variant='outlined' onClick={() => handleRating(0)}>AutoI right</Button>
          <Button variant='outlined' onClick={() => handleRating(1)}>SelfE right</Button>
          <Button variant='outlined' onClick={() => handleRating(2)}>Both right</Button>
          <Button variant='outlined' onClick={() => handleRating(3)}>Both wrong</Button>
          <Button variant='outlined' onClick={() => handleRating(4)}>Not top</Button>
          <Button variant='outlined' onClick={() => handleRating(5)}>Not sure</Button>
        </div>
      </header>
    </div>
  );
}

export default App;
