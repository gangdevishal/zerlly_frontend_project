import axios from "axios";

import { API_URL, GET_PENDING_DEAL_VALUES_WITH_STAGES, GET_WON_LOST_DEAL_VALUES, GET_CANCELLED_DEAL_VALUES, GET_NET_DEAL_VALUES } from "./types";
import { setAlert } from "./alert";

// Get Pendind Deal value 
export const getPendingValuesWithStages = (param) => async (dispatch) => {
  try {
    let query = [];
    if (param) {
      for (const key in param) {
        if (param.hasOwnProperty(key)) {
          query.push(`${key}=${param[key]}`);
        }
      }
    }
    query = query.join(`&`);
    const res = await axios.get(
      `${API_URL}/report/getPendingValuesWithStages?${query}`
    );
    dispatch({ type: GET_PENDING_DEAL_VALUES_WITH_STAGES, payload: res.data.data });
  } catch (err) {
    dispatch(setAlert(err.message, "danger"));
  }
};

// Get Stages
export const getWonLostDealValues = (param) => async (dispatch) => {
  try {
    let query = [];
    if (param) {
      for (const key in param) {
        if (param.hasOwnProperty(key)) {
          query.push(`${key}=${param[key]}`);
        }
      }
    }
    query = query.join(`&`);
    const res = await axios.get(
      `${API_URL}/report/getWonLostDealValues?${query}`
    );
    dispatch({ type: GET_WON_LOST_DEAL_VALUES, payload: res.data.data });
  } catch (err) {
    dispatch(setAlert(err.message, "danger"));
  }
};

// Get Cancelled Deal value 
export const getCancelledDealValues = (param) => async (dispatch) => {
  try {
    let query = [];
    if (param) {
      for (const key in param) {
        if (param.hasOwnProperty(key)) {
          query.push(`${key}=${param[key]}`);
        }
      }
    }
    query = query.join(`&`);
    const res = await axios.get(
      `${API_URL}/report/getCancelledDealValues?${query}`
    );
    dispatch({ type: GET_CANCELLED_DEAL_VALUES, payload: res.data.data });
  } catch (err) {
    dispatch(setAlert(err.message, "danger"));
  }
};

// Get Net Deal value 
export const getNetDealValues = (param) => async (dispatch) => {
  try {
    let query = [];
    if (param) {
      for (const key in param) {
        if (param.hasOwnProperty(key)) {
          query.push(`${key}=${param[key]}`);
        }
      }
    }
    query = query.join(`&`);
    const res = await axios.get(
      `${API_URL}/report/getNetDealValues?${query}`
    );
    dispatch({ type: GET_NET_DEAL_VALUES, payload: res.data.data });
  } catch (err) {
    dispatch(setAlert(err.message, "danger"));
  }
};