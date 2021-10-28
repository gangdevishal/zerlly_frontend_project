import axios from "axios";

import { API_URL, GET_USER, GET_USERS } from "./types";
import { setAlert } from "./alert";
export const getUser = (param) => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/admin/user/${param}`);
    dispatch({ type: GET_USER, payload: res.data.user });
  } catch (err) {
    dispatch(setAlert(err.message, "danger"));
  }
};

export const getUsers = () => async (dispatch) => {
  try {
    const res = await axios.get(`${API_URL}/user`);
    dispatch({ type: GET_USERS, payload: res.data.users });
  } catch (err) {
    dispatch(setAlert(err.message, "danger"));
  }
};
