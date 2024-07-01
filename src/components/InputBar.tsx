import { Box, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";
import "./InputBar.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
export function InputBar({
  setOffset,
  setLength,
  setProbeLayer,
  offset,
  length,
  probeLayer
}: {
  setOffset: (value: number) => void;
  setLength: (value: number) => void;
  setProbeLayer: (value: number) => void;
  offset: number;
  length: number;
  probeLayer: number;
}) {
  return (
    <div className="input-bar">

    <ThemeProvider theme={darkTheme}>
      <Box
      // sx={{
      //   borderRadius: 1,
      //   bgcolor: 'primary.main',
      //   '&:hover': {
      //     bgcolor: 'primary.dark',
      //   },
      // }}
      >
        <div className="inside-input">
          <div>Offset:</div> 
          <NumberInput
            id="offset-input"
            // label="Offset" 
            value={offset}
            min={0}
            max={8000}
            onChange={(e, v) => {
              setOffset(v || 1000);
            }}
          />
          <div>Length:</div>
          <NumberInput
            id="length-input"
            defaultValue={length}
            min={1}
            max={100}
            onChange={(e, v) => {
              setLength(v || 10);
            }}
          />
          <div>Probe Layer:</div>
          <NumberInput
            id="probe-layer-input"
            defaultValue={probeLayer}
            min={0}
            max={16}
            onChange={(e, v) => {
              setProbeLayer(v || 16);
            }}
          />
        </div>
      </Box>
    </ThemeProvider>
    </div>
  );
}