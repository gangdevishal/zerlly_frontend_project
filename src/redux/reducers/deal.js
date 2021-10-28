import {
  GET_DEALS,
  GET_DEAL,
  UPDATE_DEAL,
  DELETE_DEAL,
  GET_DEAL_LOGS,
  ADD_DEAL_NOTES,
  GET_DEAL_NOTES,
  GET_WON_DEAL,
  EMPTY_SINGLE_DEAL,
  GET_DEAL_LOST_REASONS,
  SET_DEAL_FILTER_FIELDS,
  GET_CANCEL_DEALS,
  APPEND_CANCEL_DEALS,
  DELETE_CANCEL_DEAL
} from "../actions/types";
const initialState = { list: [], pagination:{}, single: null, edit:null, notes:[], logs:[], lost_reasons:[], filter_fields:null, cancel_deals:{list:[],pagination:{}} };

const dealReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_DEALS:
      return { 
        ...state, 
        list: payload.pagination.currentPage == 1 ? payload.list :  [...state.list.concat(payload.list)] ,
        pagination: payload.pagination
      };

    case GET_DEAL:
      return { ...state, single: payload.detail, edit: payload.edit,drop: false };

    case DELETE_DEAL:
      return {
        ...state,
        list: state.list.filter((deal) => deal._id !== payload),
      };

    case UPDATE_DEAL:
      return {
        ...state,
        list: state.list.map((deal) =>
          deal._id === payload.list._id ? payload.list : deal
        ),
        edit:payload.edit,
      };

    case ADD_DEAL_NOTES:
      return {
        ...state,
        notes: [...state.notes, payload],
     
      };

    case GET_DEAL_LOGS:
      return { ...state, logs: payload};

    case GET_DEAL_NOTES:
      return { ...state, notes: payload };

    case GET_WON_DEAL:
      return {
        ...state,
        list: state.list.filter((deal) => deal.is_deal_won == 1),
        final_list: state.final_list.filter((deal) => deal.is_deal_won == 1),
      };
    
    case EMPTY_SINGLE_DEAL:
      return {
        ...state,
        single: null
      };
     
    case GET_DEAL_LOST_REASONS:
      return {
        ...state,
        lost_reasons:payload,
      };
    
    case SET_DEAL_FILTER_FIELDS:
      return {
        ...state,
        filter_fields:payload
      };

    case GET_CANCEL_DEALS:
      return {
        ...state,
        cancel_deals: {
          ...state.cancel_deals,
          list: payload.pagination.currentPage == 1 ? payload.list :  [...state.cancel_deals.list.concat(payload.list)],
          pagination: payload.pagination,
        },
      };

      return { 
        ...state, 
        list: payload.pagination.currentPage == 1 ? payload.list :  [...state.list.concat(payload.list)] ,
        pagination: payload.pagination
      };

    case APPEND_CANCEL_DEALS:
      return {
        ...state,
        cancel_deals: { ...state.cancel_deals, list:[...state.cancel_deals.list.concat(payload.list)], pagination:payload.pagination  }
      };

    case DELETE_CANCEL_DEAL:
      return {
        ...state,
        cancel_deals:  { ...state.cancel_deals, list: state.cancel_deals.list.filter((deal) => deal._id !== payload)},
      };

    default:
      return state;
  }
};

export default dealReducer;
