import {
  GET_CONTACTS,
  GET_CONTACT,
  UPDATE_CONTACT,
  DELETE_CONTACT,
  GET_CONTACT_LOGS,
  ADD_CONTACT_NOTES,
  GET_CONTACT_NOTES,
  REDIRECT_CONTACT,
  NEW_DEAL,
  SET_CONTACT_FILTER_FIELDS
} from "../actions/types";

const initialState = { list: [], pagination:{}, single: null, edit:null, notes:[], logs:[], new_deal:null, filter_fields:null };

const contactReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_CONTACTS:
      return { 
        ...state, 
        list: payload.pagination.currentPage == 1 ? payload.list :  [...state.list.concat(payload.list)] ,
        pagination: payload.pagination
      };

    case GET_CONTACT:
      return { ...state, single: payload.detail, edit: payload.edit };

    case DELETE_CONTACT:
      return {
        ...state,
        list: state.list.filter((contact) => contact._id !== payload),
      };

    case UPDATE_CONTACT:
      return {
        ...state,
        list: state.list.map((contact) =>
          contact._id === payload.list._id ? payload.list : contact
        ),
        edit:payload.edit
      };

    case ADD_CONTACT_NOTES:
      return {
        ...state,
        notes: [...state.notes, payload],
      };

    case GET_CONTACT_LOGS:
      return { ...state, logs: payload };

    case GET_CONTACT_NOTES:
      return { ...state, notes: payload };

    case REDIRECT_CONTACT:
      return {
        ...state,
        list: state.list.filter((contact) => contact._id == payload),
      };

    case NEW_DEAL:
      return { ...state, new_deal:payload };

    case SET_CONTACT_FILTER_FIELDS:
      return {
        ...state,
        filter_fields:payload
      };
    
    default:
      return state;
  }
};

export default contactReducer;
