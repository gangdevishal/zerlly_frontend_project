import axios from "axios";

import {
  API_URL,
  ADD_CONTACT,
  UPDATE_CONTACT,
  GET_CONTACTS,
  GET_CONTACT,
  DELETE_CONTACT,
  ADD_CONTACT_NOTES,
  GET_CONTACT_NOTES,
  GET_CONTACT_LOGS,
  REDIRECT_CONTACT,
  SORT_CONTACT_FIELD,
  PAGINATE_CONTACTS,
  NEW_DEAL,
  APPEND_CONTACTS,
  SET_CONTACT_FILTER_FIELDS
} from "./types";
import { setAlert } from './alert';

// Get Contacts
export const getContacts = (param) => async (dispatch) => {
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
    const res = await axios.get(`${API_URL}/contact/all?${query}`);
    dispatch({ type: GET_CONTACTS, payload: { list:res.data.contacts, pagination:res.data.pagination }});
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Add Contact
export const addContact = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/contact/add`, formData);
    if(res.data.success){
      dispatch({ type: ADD_CONTACT, payload: res.data.contact });
      dispatch({ type: PAGINATE_CONTACTS });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};


// Filter Contact
export const filterContact = (param,alert=true) => async (dispatch) => {
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
    const res = await axios.post(`${API_URL}/contact/filter?${query}`, param.formField);
    if(res.data.success){
      dispatch({ type: GET_CONTACTS, payload: {list:res.data.contacts,pagination:res.data.pagination} });
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

// Get Single Contact
export const getContact = (param) => async (dispatch) => {
    try {
      const res = await axios.get(`${API_URL}/contact/get/${param._id}`);
      dispatch({ type: GET_CONTACT, payload:{ edit:res.data.edit , detail:res.data.detail }   });
      // dispatch(setAlert(res.data.msg, 'success'));
    } catch (err) {
      dispatch(setAlert(err.message, 'danger'));
    }
  };

// Delete Contact
export const deleteContact = (id) => async (dispatch) => {
  try {
    if(!id){
      dispatch(setAlert('Please select any record', 'warning'));
      return false;
    }
    const res = await axios.delete(`${API_URL}/contact/delete/${id}`);
    dispatch({ type: DELETE_CONTACT, payload: id });
    dispatch({ type: PAGINATE_CONTACTS }); 
    dispatch(setAlert(res.data.msg, 'success'));
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Update Contact
export const updateContact = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/contact/update`, formData);
    if(res.data.success){
      dispatch({ type: UPDATE_CONTACT, payload: { list:res.data.list, edit:res.data.edit } });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }   
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Add Contact Notes
export const addNotes = (formData,query_param='') => async (dispatch) => {
  try {
    let timezone = (query_param && query_param.timezone) ? query_param.timezone : '';
    const res = await axios.post(`${API_URL}/contact/addNotes?timezone=${timezone}`, formData);
    if(res.data.success){
      dispatch({ type: ADD_CONTACT_NOTES, payload: res.data.note });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Contact Logs
export const getLogs = (param) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/contact/logs/all?contact_id=${param.contact_id}&timezone=${param.timezone}`);
    dispatch({ type: GET_CONTACT_LOGS, payload: res.data.logs });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};


// Get Contact Notes
export const getNotes = (param) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/contact/notes/all?contact_id=${param.contact_id}&timezone=${param.timezone}`);
    dispatch({ type: GET_CONTACT_NOTES, payload: res.data.notes });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Redirect Contact
export const redirectContact = (id) => async (dispatch) => {
  try {
    dispatch({ type: REDIRECT_CONTACT, payload: id });
    dispatch({ type: PAGINATE_CONTACTS }); 
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Sort Contact Field
export const sortContactField = (param) => async (dispatch) => {
  try {
    dispatch({ type: SORT_CONTACT_FIELD, payload: param });  
    dispatch({ type: PAGINATE_CONTACTS });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Paginate Contact Field
export const paginateRecords = (param) => async (dispatch) => {
  try {
    dispatch({ type: PAGINATE_CONTACTS, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Import Contact
export const importContact = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/contact/import`,formData);
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

// New Deal From
export const setNewDeal = (param) => async (dispatch) => {
  try {
    dispatch({ type: NEW_DEAL, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Append Contact
export const appendRecords = (param) => async (dispatch) => {
  try {
    dispatch({ type: APPEND_CONTACTS, payload: param });  
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Set Filter Fields
export const setFilterFields = (fields) => async (dispatch) => {
  try {
    dispatch({ type: SET_CONTACT_FILTER_FIELDS, payload: fields });       

  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};