import { Box, MenuItem, Select, TextField, Typography, FormControl, InputLabel } from "@mui/material";
import "./InputBar.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const layerOptions: Map<string, { label: string, value: number }[]> = new Map([
  ['jb-r', [
    { label: '6 (base)', value: 6 },
    { label: '12 (it)', value: 12 },
  ]],
  ['our-r', [3, 4, 6, 8, 7, 9, 10, 11, 12, 13, 14, 15].map((x, _) => ({ label: x.toString(), value: x }))],
  ['our-ao', [6, 8, 7, 9, 10, 11, 12, 13, 14, 15, 16].map((x, _) => ({ label: x.toString(), value: x}))],
  ['our-t', [5, 6, 8, 7, 9, 10, 11, 12, 13, 14, 15, 16].map((x, _) => ({ label: x.toString(), value: x}))],
]);

export function InputBar({
  setOffset,
  setLength,
  setProbeLayer,
  setLayer,
  setAlpha,
  setRequiredScale,
  setTargetFeature,
  setVersion,
  offset,
  length,
  probeLayer,
  layer,
  alpha,
  requiredScale,
  targetFeature,
  version
}: {
  setOffset: (value: number) => void;
  setLength: (value: number) => void;
  setProbeLayer: (value: number) => void;
  setLayer: (value: number) => void;
  setAlpha: (value: number) => void;
  setRequiredScale: (value: number) => void;
  setTargetFeature: (value: null | number) => void;
  setVersion: (value: string) => void;
  offset: number;
  length: number;
  probeLayer: number;
  layer: number;
  alpha: number;
  requiredScale: number;
  targetFeature: number | null;
  version: string;
}) {
  const [localOffset, setLocalOffset] = useState(offset.toString());
  const [localLength, setLocalLength] = useState(length.toString());
  const [localProbeLayer, setLocalProbeLayer] = useState(probeLayer.toString());
  const [localAlpha, setLocalAlpha] = useState(alpha.toString());
  const [localRequiredScale, setLocalRequiredScale] = useState(requiredScale.toString());
  const [localTargetFeature, setLocalTargetFeature] = useState(targetFeature !== null ? targetFeature.toString() : "");

  const handleBlurOrEnter = (setFunc: (value: number) => void, value: string, defaultValue: number, isFloat: boolean = false) => {
    const parsedValue = isFloat ? parseFloat(value) : parseInt(value);
    setFunc(isNaN(parsedValue) ? defaultValue : parsedValue);
  };

  const handleBlurOrEnterTargetFeature = (value: string, defaultValue: number | null) => {
    console.log(value);
    if (value === "") {
      setTargetFeature(defaultValue);
      return;
    }
    const parsedValue = parseInt(value);
    setTargetFeature(isNaN(parsedValue) ? defaultValue : parsedValue);
  }

  useEffect(() => {
    setLocalOffset(offset.toString());
    setLocalLength(length.toString());
    setLocalProbeLayer(probeLayer.toString());
    setLocalAlpha(alpha.toString());
    setLocalRequiredScale(requiredScale.toString());
  }, [offset, length, probeLayer, layer, alpha, requiredScale]);

  return (
    <div className="input-bar">
      <ThemeProvider theme={darkTheme}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: 2,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <FormControl sx={{ minWidth: 100, marginRight: 2 }}>
            <InputLabel id="version-select-label">Version</InputLabel>
            <Select
              labelId="version-select-label"
              id="version-select"
              value={version}
              label="Version"
              onChange={(e: any) => setVersion(e.target.value)}
            >
              <MenuItem value="jb-r">jb-r</MenuItem>
              <MenuItem value="our-r">our-r</MenuItem>
              <MenuItem value="our-ao">our-ao</MenuItem>
              <MenuItem value="our-t">our-t</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100, marginRight: 2 }}>
            <InputLabel id="layer-select-label">Layer</InputLabel>
            <Select
              labelId="layer-select-label"
              id="layer-select"
              value={layer}
              label="Layer"
              onChange={(e: any) => setLayer(e.target.value)}
            >
              {layerOptions.get(version)!.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            id="offset-input"
            type="tel"
            label="Offset"
            value={localOffset}
            InputProps={{ inputProps: { min: 0, max: 8000 } }}
            onChange={(e) => setLocalOffset(e.target.value)}
            onBlur={() => handleBlurOrEnter(setOffset, localOffset, 1000)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBlurOrEnter(setOffset, localOffset, 1000);
              }
            }}
            sx={{ minWidth: 100, marginRight: 2 }}
          />
          <TextField
            id="length-input"
            type="tel"
            label="Length"
            value={localLength}
            InputProps={{ inputProps: { min: 1, max: 100 } }}
            onChange={(e) => setLocalLength(e.target.value)}
            onBlur={() => handleBlurOrEnter(setLength, localLength, 10)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBlurOrEnter(setLength, localLength, 10);
              }
            }}
            sx={{ minWidth: 100, marginRight: 2 }}
          />
          <TextField
            id="probe-layer-input"
            type="tel"
            label="Probe Layer"
            value={localProbeLayer}
            InputProps={{ inputProps: { min: 0, max: 16 } }}
            onChange={(e) => setLocalProbeLayer(e.target.value)}
            onBlur={() => handleBlurOrEnter(setProbeLayer, localProbeLayer, 16)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBlurOrEnter(setProbeLayer, localProbeLayer, 16);
              }
            }}
            sx={{ minWidth: 100 }}
          />

          <TextField
            id="alpha-input"
            type="tel"
            label="Alpha"
            value={localAlpha}
            InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
            onChange={(e) => setLocalAlpha(e.target.value)}
            onBlur={() => handleBlurOrEnter(setAlpha, localAlpha, 1, true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBlurOrEnter(setAlpha, localAlpha, 1, true);
              }
            }}
            sx={{ minWidth: 100 }}
          />

          <TextField
            id="required-scale-input"
            type="tel"
            label="Required Scale"
            value={localRequiredScale}
            InputProps={{ inputProps: { min: 0, max: 200, step: 0.1 } }}
            onChange={(e) => setLocalRequiredScale(e.target.value)}
            onBlur={() => handleBlurOrEnter(setRequiredScale, localRequiredScale, 10, true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBlurOrEnter(setRequiredScale, localRequiredScale, 10, true);
              }
            }}
            sx={{ minWidth: 100 }}
          />

          <TextField
            id="target-feature-input"
            type="tel"
            label="Target Feature"
            value={localTargetFeature}
            InputProps={{ inputProps: { min: 0} }}
            onChange={(e) => setLocalTargetFeature(e.target.value)}
            onBlur={() => handleBlurOrEnterTargetFeature(localTargetFeature, null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBlurOrEnterTargetFeature(localTargetFeature, null);
              }
            }}
            sx={{ minWidth: 100 }}
          />
        </Box>
      </ThemeProvider>
    </div>
  );
}
