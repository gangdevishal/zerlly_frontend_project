import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// Redux
import { Provider } from "react-redux";
import { store } from "./redux/store";
import './i18n';
//
import { ConfigProvider } from 'antd';
import en_GB from 'antd/lib/locale-provider/en_GB';
import moment from 'moment';
import 'moment/locale/en-gb';  // important!

moment.locale('en-gb');  // important!
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');

ReactDOM.render(
  <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter basename={baseUrl}>
          <ConfigProvider locale={en_GB}>
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </HelmetProvider>
  </Provider>,
  document.getElementById("root")
);

reportWebVitals();
