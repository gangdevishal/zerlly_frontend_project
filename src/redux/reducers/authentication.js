import {
    AUTH_LOGIN,AUTH_LOGOUT, AUTH_ERROR,UPDATE_PROFILE, GET_PROFILE
} from "../actions/types";

import { isLogin, getLoginData } from "../../utils/auth";


const initialState = { 
  login: (isLogin()) ? true : false, 
  user: (isLogin()) ? getLoginData().user : null, 
  won_deal_ratio:'',
  lost_deal_ratio:'',
  error:null 
};

export default function authReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case AUTH_LOGIN:
      return { ...state, user: payload, login: true, error:null };

    case AUTH_LOGOUT:
      return { ...state, login:false, user:null, error:null };

    case AUTH_ERROR:
      return { ...state, user: null, login: false, error:payload };

    case UPDATE_PROFILE:
        return { ...state, user: payload };

    case GET_PROFILE:
      return { ...state, won_deal_ratio:payload.won_deal_ratio,lost_deal_ratio:payload.lost_deal_ratio };
    default:
      return state;
  }
};


