import {
  
    GET_USER,
    GET_USERS,
    UPDATE_USER,
  
  } from "../actions/types";
  
  const initialState = { list: [], single: null };
  
  const usersReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case GET_USERS:
        return { ...state, list: payload };

      case GET_USER:
        return { ...state, single: payload };
  
      case UPDATE_USER:
        return {
          ...state,
          list: state.list.map((user) =>
            user._id === payload._id ? payload : user
          ),
        };
  
      default:
        return state;
    }
  };
  
  export default usersReducer;
  