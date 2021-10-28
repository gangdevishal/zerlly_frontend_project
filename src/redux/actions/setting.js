import axios from "axios";

import {
  API_URL,
  GET_SETTING
  ,AUTH_ERROR

} from "./types";
import { setAlert } from './alert';

  
// Notifications Logs
export const settingLog = (formData,config) => async (dispatch) => {
    try {
      const res = await axios.post(`${API_URL}/user/addsettings/`,formData,config);
    } catch (err) {
      dispatch(setAlert(err.message, 'danger'));
    }
  };
  

  export const getSetting = (param) => async (dispatch) => {
    console.log(param)
      try {
        const res = await axios.get(`${API_URL}/user/settings/${param}`);
        dispatch({ type: GET_SETTING, payload: res.data.data });
      } catch (err) {
        dispatch(setAlert(err.message, 'danger'));
      }
    };