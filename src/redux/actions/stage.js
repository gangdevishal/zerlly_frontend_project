import axios from "axios";

import {
  API_URL,
  GET_STAGES,
  UPDATE_STAGE,
  SORT_STAGE_CARD,
  FILTER_STAGE_CARD,
  SET_STAGE_FILTER_FIELDS
} from "./types";
import { setAlert } from './alert';

// Get Stages
export const getStages = (param) => async (dispatch) => {
  try {
    let query = [];
    if(param){
      for (const key in param) {
        if (param.hasOwnProperty(key)) {
          query.push(`${key}=${param[key]}`);        
        }
      }
    }
    query = query.join(`&`);
    const res = await axios.get(`${API_URL}/stage/all?${query}`);
    dispatch({ type: GET_STAGES, payload: { stages:res.data.stages, card_count:res.data.card_count } });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Update Stages
export const updateStage = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/stage/update`,formData);
    if(res.data.success){
      // dispatch({ type: UPDATE_STAGE, payload: { stages:res.data.stages, card_count:res.data.card_count } });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }   
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Delete Deal Stages
export const deleteDealStage = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/stage/deleteDealStage`, formData);
    if(res.data.success){
      // dispatch({ type: UPDATE_STAGE, payload: { stages:res.data.stages, card_count:res.data.card_count } });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }   
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Update Deal Stages
export const sortSalesboardCard = (param) => async (dispatch) => {
  try {
    dispatch({ type: SORT_STAGE_CARD, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Filter Deal Stages
export const filterSalesboardCard = (param) => async (dispatch) => {
  try {
    dispatch({ type: FILTER_STAGE_CARD, payload: param });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Filter Deal Stages New
export const filterSalesboardDeal = (formData, alert=true) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/stage/filter`, formData);
    if(res.data.success){
      dispatch({ type: UPDATE_STAGE, payload: { stages:res.data.stages, card_count:res.data.card_count } });
      if(alert){
        dispatch(setAlert(res.data.msg, 'success'));
      }
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Set Filter Fields
export const setFilterFields = (fields) => async (dispatch) => {
  try {
    dispatch({ type: SET_STAGE_FILTER_FIELDS, payload: fields });     
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};