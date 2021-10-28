import axios from "axios";

import {
  API_URL,
  GET_ORGANISATION_FIELDS,
  GET_CONTACT_FIELDS,
  GET_DEAL_FIELDS,
  GET_ORGANIZATION_CONTACTS
} from "./types";
import { setAlert } from './alert';

// Get Data
export const getOrganisationFields = () => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/custom_table/getOrganisationFields`);
    dispatch({ type: GET_ORGANISATION_FIELDS, payload: res.data.fields });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Data
export const getContactFields = () => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/custom_table/getContactFields`);
    dispatch({ type: GET_CONTACT_FIELDS, payload: res.data.fields });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Data
export const getDealFields = () => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/custom_table/getDealFields`);
    dispatch({ type: GET_DEAL_FIELDS, payload: res.data.fields });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get Contacts of Organization
export const getContactsOfOrganization = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/custom_table/organizationContact`,formData);
    if(res.data.success){
      dispatch({ type: GET_ORGANIZATION_CONTACTS, payload: res.data.contacts });
      // dispatch(setAlert(res.data.msg, 'success'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};