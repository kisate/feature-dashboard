import { Box, MenuItem, Select, TextField, Typography, FormControl, InputLabel } from "@mui/material";
import "./InputBar.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export function InputBar({
  setOffset,
  setLength,
  setProbeLayer,
  setLayer,
  offset,
  length,
  probeLayer,
  layer
}: {
  setOffset: (value: number) => void;
  setLength: (value: number) => void;
  setProbeLayer: (value: number) => void;
  setLayer: (value: number) => void;
  offset: number;
  length: number;
  probeLayer: number;
  layer: number;
}) {
  const [localOffset, setLocalOffset] = useState(offset.toString());
  const [localLength, setLocalLength] = useState(length.toString());
  const [localProbeLayer, setLocalProbeLayer] = useState(probeLayer.toString());

  const handleBlurOrEnter = (setFunc: (value: number) => void, value: string, defaultValue: number) => {
    const parsedValue = parseInt(value, 10);
    setFunc(isNaN(parsedValue) ? defaultValue : parsedValue);
  };

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
            <InputLabel id="layer-select-label">Layer</InputLabel>
            <Select
              labelId="layer-select-label"
              id="layer-select"
              value={layer}
              label="Layer"
              onChange={(e: any) => setLayer(e.target.value)}
            >
              <MenuItem value={6}>6 (base)</MenuItem>
              <MenuItem value={12}>12 (it)</MenuItem>
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
        </Box>
      </ThemeProvider>
    </div>
  );
}