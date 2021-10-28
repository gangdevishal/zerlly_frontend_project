import {
  ADD_NOTIFICATION,
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS,
} from "../actions/types";

const initialState = { list: [], single: null, unread_count:0 };

const notificationReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_NOTIFICATIONS:
      return { ...state, list: payload.notifications, unread_count:payload.unread_count };

    case ADD_NOTIFICATION:
      return {
        ...state,
        list: [...state.list, payload],
      };
    
    case GET_UNREAD_NOTIFICATIONS:
      return { ...state, unread_count: payload.unread_count };
  
    default:
      return state;
  }
};

export default notificationReducer;
