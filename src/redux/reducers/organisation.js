import {
    GET_ORGANISATIONS,
    GET_ORGANISATION,
    UPDATE_ORGANISATION,
    DELETE_ORGANISATION,
    GET_ORGANISATION_LOGS,
    ADD_ORGANISATION_NOTES,
    GET_ORGANISATION_NOTES,
    SET_ORGANISATION_FILTER_FIELDS,
    NEW_CONTACT
  } from "../actions/types";
  const initialState = { list: [], pagination:{}, single: null, edit:null, notes:[], logs:[], filter_fields:null, new_contact:null };
  
  const organisationsReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
      case GET_ORGANISATIONS:
        return { 
          ...state, 
          list: payload.pagination.currentPage == 1 ? payload.list :  [...state.list.concat(payload.list)] ,
          pagination: payload.pagination
        };
  
      case GET_ORGANISATION:
        return { ...state, single: payload.detail, edit: payload.edit };
  
      case DELETE_ORGANISATION:
        return {
          ...state,
          list: state.list.filter((organisation) => organisation._id !== payload),
        };
  
      case UPDATE_ORGANISATION:
        return {
          ...state,
          list: state.list.map((organisation) =>
            organisation._id === payload.list._id ? payload.list : organisation
          ),
          edit:payload.edit
        };

      case ADD_ORGANISATION_NOTES:
        return {
          ...state,
          notes: [...state.notes, payload],
        };

      case GET_ORGANISATION_LOGS:
        return { ...state, logs: payload };

      case GET_ORGANISATION_NOTES:
        return { ...state, notes: payload };

      case SET_ORGANISATION_FILTER_FIELDS:
        return {
          ...state,
          filter_fields:payload
        };

      case NEW_CONTACT:
        return { ...state, new_contact:payload };
  
      default:
        return state;
    }
  };
  
export default organisationsReducer;
  