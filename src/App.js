import React, { Fragment, Suspense } from "react";
import "./App.css";
import AppRouter from "./route";
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from "./components/themes/Globalstyle";
import { useSelector } from 'react-redux';

function App() {
  const theme = useSelector((state) => state.theme);
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles/>
      <Suspense fallback="Loading...">
        <AppRouter />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
