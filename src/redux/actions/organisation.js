import axios from "axios";

import {
  API_URL,
  UPDATE_ORGANISATION,
  GET_ORGANISATIONS,
  GET_ORGANISATION,
  ADD_ORGANISATION_NOTES,
  GET_ORGANISATION_NOTES,
  GET_ORGANISATION_LOGS,
  PAGINATE_ORGANIZATIONS,
  SET_ORGANISATION_FILTER_FIELDS,
  NEW_CONTACT,
} from "./types";
import { setAlert } from './alert';

// Get Organisations
export const getOrganisations = (param) => async (dispatch) => {
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
    const res = await axios.get(`${API_URL}/organisation/all?${query}`);
    dispatch({ type: GET_ORGANISATIONS, payload: { list:res.data.organisations, pagination:res.data.pagination }});
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Add Organisation
export const addOrganisation = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/organisation/add`, formData);
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


// Filter Organisation
export const filterOrganisation = (param,alert=true) => async (dispatch) => {
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
    const res = await axios.post(`${API_URL}/organisation/filter?${query}`, param.formField);
    if(res.data.success){
      dispatch({ type: GET_ORGANISATIONS, payload: {list:res.data.organisations,pagination:res.data.pagination} });
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

// Get Single Organisation
export const getOrganisation = (param) => async (dispatch) => {
    try {
      const res = await axios.get(`${API_URL}/organisation/get/${param._id}`);
      dispatch({ type: GET_ORGANISATION, payload:{ edit:res.data.edit , detail:res.data.detail }   });
      // dispatch(setAlert(res.data.msg, 'success'));
    } catch (err) {
      dispatch(setAlert(err.message, 'danger'));
    }
  };

// Delete Organisation
export const deleteOrganisation = (id) => async (dispatch) => {
  try {
    if(!id){
      dispatch(setAlert('Please select any record', 'warning'));
      return false;
    }
    const res = await axios.delete(`${API_URL}/organisation/delete/${id}`);
    dispatch(setAlert(res.data.msg, 'success'));
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Update Organisation
export const updateOrganisation = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/organisation/update`, formData);
    if(res.data.success){
      dispatch({ type: UPDATE_ORGANISATION, payload: { list:res.data.list, edit:res.data.edit } });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }   
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Add Organisation Notes
export const addNotes = (formData,query_param='') => async (dispatch) => {
  try {
    let timezone = (query_param && query_param.timezone) ? query_param.timezone : '';
    const res = await axios.post(`${API_URL}/organisation/addNotes?timezone=${timezone}`, formData);
    if(res.data.success){
      dispatch({ type: ADD_ORGANISATION_NOTES, payload: res.data.note });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Organisation Logs
export const getLogs = (param) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/organisation/logs/all?orgId=${param.org_id}&timezone=${param.timezone}`);
    dispatch({ type: GET_ORGANISATION_LOGS, payload: res.data.logs });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};


// Get Organisation Notes
export const getNotes = (param) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/organisation/notes/all?orgId=${param.org_id}&timezone=${param.timezone}`);
    dispatch({ type: GET_ORGANISATION_NOTES, payload: res.data.notes });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Paginate Org Field
export const paginateRecords = (param) => async (dispatch) => {
  try {
    dispatch({ type: PAGINATE_ORGANIZATIONS, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Import Organization
export const importOrganization = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/organisation/import`,formData);
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

// Set Filter Fields
export const setFilterFields = (fields) => async (dispatch) => {
  try {
    dispatch({ type: SET_ORGANISATION_FILTER_FIELDS, payload: fields });       

  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// New Contact From
export const setNewContact = (param) => async (dispatch) => {
  try {
    dispatch({ type: NEW_CONTACT, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};