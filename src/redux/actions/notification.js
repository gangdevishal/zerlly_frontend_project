import axios from "axios";

import {
  API_URL,
  ADD_NOTIFICATION,
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS,
} from "./types";
import { setAlert } from './alert';

// Get Notifications
export const getNotifications = (param) => async (dispatch) => {
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
    const res = await axios.get(`${API_URL}/notification/all?${query}`);
    dispatch({ type: GET_NOTIFICATIONS, payload: {notifications:res.data.notifications, unread_count:res.data.unread_count} });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Add Notification
export const addNotification = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_URL}/notification/add`, formData);
    if(res.data.success){
      dispatch({ type: ADD_NOTIFICATION, payload: res.data.notification });
      dispatch(setAlert(res.data.msg, 'success'));
    }
    else{
      dispatch(setAlert(res.data.msg, 'warning'));
    }
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

// Get All Unread Notifications
export const getUnreadNotifications = (param) => async (dispatch) => {
  try {
    let query = [];
    if(param){
      if(param.user){
        query.push(`user=${param.user}`);
      }
    }
    query = query.join(`&`);
    const res = await axios.get(`${API_URL}/notification/all/unread?${query}`);
    dispatch({ type: GET_UNREAD_NOTIFICATIONS, payload: { unread_count:res.data.total_unread_notification } });
  } catch (err) {
    dispatch(setAlert(err.message, 'danger'));
  }
};

