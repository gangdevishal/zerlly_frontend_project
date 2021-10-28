import axios from "axios";

import {
  API_URL,
  UPDATE_DEAL,
  GET_DEALS,
  GET_DEAL,
  ADD_DEAL_NOTES,
  GET_DEAL_NOTES,
  GET_DEAL_LOGS,
  UPDATE_DEAL_ACTION,
  GET_WON_DEAL,
  EMPTY_SINGLE_DEAL,
  PAGINATE_DEALS,
  GET_DEAL_LOST_REASONS,
  APPEND_DEALS,
  SET_DEAL_FILTER_FIELDS,
  GET_CANCEL_DEALS,
  APPEND_CANCEL_DEALS,
  DELETE_CANCEL_DEAL,
} from "./types";
import { setAlert } from './alert';

// Get Deals
export const getDeals = (param) => async (dispatch) => {
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
    console.log('query:',query);
    const res = await axios.get(`${API_URL}/deal/all?${query}`);
    dispatch({ type: GET_DEALS, payload: {list:res.data.deals,pagination:res.data.pagination} });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Add Deal
export const addDeal = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/deal/add`, formData);
    if(res.data.success){ 
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};


// Filter Deal
export const filterDeal = (param, alert=true) => async (dispatch) => {
  try {
    let query = [];
    if(param && param.other){
      let parama=param.other;
      for (const key in parama) {
        if (parama.hasOwnProperty(key)) {
          query.push(`${key}=${parama[key]}`);        
        }
      }
    }
    query = query.join(`&`);
    const res = await axios.post(`${API_URL}/deal/filter?${query}`, param.formField);
    if(res.data.success){
      dispatch({ type: GET_DEALS, payload: {list:res.data.deals,pagination:res.data.pagination} });
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

// Get Single Deal
export const getDeal = (param) => async (dispatch) => {
    try {
      let query = [];
    if(param && param.other){
      let parama=param.other;
      for (const key in parama) {
        if (parama.hasOwnProperty(key)) {
          query.push(`${key}=${parama[key]}`);        
        }
      }
    }
    query = query.join(`&`);
      const res = await axios.get(`${API_URL}/deal/get/${param._id}?${query}`);
      dispatch({ type: GET_DEAL, payload:{ edit:res.data.edit , detail:res.data.detail }   });
      // dispatch(setAlert(res.data.msg, 'success'));
    } catch (err) {
      dispatch(setAlert(err.message, 'danger'));
    }
  };

// Delete Deal
export const deleteDeal = (id) => async (dispatch) => {
  try {
    if(!id){
      dispatch(setAlert('Please select any record', 'warning'));
      return false;
    }
    const res = await axios.delete(`${API_URL}/deal/delete/${id}`);
    dispatch(setAlert(res.data.msg, 'success'));
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Update Deal
export const updateDeal = (formData,drop) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/deal/update`, formData);
    if(res.data.success){
      dispatch({ type: UPDATE_DEAL, payload: { list:res.data.list, edit:res.data.edit} });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }   
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Add Deal Notes
export const addNotes = (formData,query_param='') => async (dispatch) => {
  try {
    let timezone = (query_param && query_param.timezone) ? query_param.timezone : '';
    const res = await axios.post(`${API_URL}/deal/addNotes?timezone=${timezone}`, formData);
    if(res.data.success){
      dispatch({ type: ADD_DEAL_NOTES, payload: res.data.note });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Deal Logs
export const getLogs = (param) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/deal/logs/all?deal_id=${param.deal_id}&timezone=${param.timezone}`);
    dispatch({ type: GET_DEAL_LOGS, payload: res.data.logs });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};


// Get Deal Notes
export const getNotes = (param) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/deal/notes/all?deal_id=${param.deal_id}&timezone=${param.timezone}`);
    dispatch({ type: GET_DEAL_NOTES, payload: res.data.notes });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Update Deal Action
export const updateDealAction = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/deal/updateAction`, formData);
    if(res.data.success){
      dispatch({ type: UPDATE_DEAL_ACTION, payload: 1});
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Won Deal
export const getWonDeal = () => async (dispatch) => {
  try {
    dispatch({ type: GET_WON_DEAL, payload: 'won' });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Paginate Org Field
export const paginateRecords = (param) => async (dispatch) => {
  try {
    dispatch({ type: PAGINATE_DEALS, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Empty Single Deal
export const emptyDealSingle = () => async (dispatch) => {
  try {
    dispatch({ type: EMPTY_SINGLE_DEAL, payload: "" });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};


// Import Deal
export const importDeal = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/deal/import`,formData);
    if(res.data.success){
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Deal Lost Reasons
export const getDealLostReasons = () => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/deal/allLostReasons`);
    dispatch({ type: GET_DEAL_LOST_REASONS, payload: res.data.reasons });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Append Deal
export const appendRecords = (param) => async (dispatch) => {
  try {
    dispatch({ type: APPEND_DEALS, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Set Filter Fields
export const setFilterFields = (fields) => async (dispatch) => {
  try {
    dispatch({ type: SET_DEAL_FILTER_FIELDS, payload: fields });       

  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Cancel Deals
export const getCancelDeals = (param) => async (dispatch) => {
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
    console.log('query:',query);
    const res = await axios.get(`${API_URL}/deal/allCancel?${query}`);
    dispatch({ type: GET_CANCEL_DEALS, payload: {list:res.data.list,pagination:res.data.pagination} });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Append Cancel Deal
export const appendCancelRecords = (param) => async (dispatch) => {
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
    console.log('query:',query);
    const res = await axios.get(`${API_URL}/deal/allCancel?${query}`);
    dispatch({ type: APPEND_CANCEL_DEALS, payload: {list:res.data.list,pagination:res.data.pagination} });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Delete Cancel Deal
export const deleteCancelDeal = (id) => async (dispatch) => {
  try {
    if(!id){
      dispatch(setAlert('Please select any checkbox', 'warning'));
      return false;
    }
    const res = await axios.delete(`${API_URL}/deal/deleteCancel/${id}`);
    if(res.data.success){
      dispatch({ type: DELETE_CANCEL_DEAL, payload: id });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};