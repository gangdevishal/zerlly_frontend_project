import {
  
    GET_SETTING,
    
  
  } from "../actions/types";
  
  const initialState = { data:null };
  
  const settingReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {  
      case GET_SETTING:
        return { ...state, data:payload };
      default:
        return state;
    }
  };
  
  export default settingReducer;
  