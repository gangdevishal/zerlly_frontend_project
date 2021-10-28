import { GET_PENDING_DEAL_VALUES_WITH_STAGES, GET_WON_LOST_DEAL_VALUES, GET_CANCELLED_DEAL_VALUES, GET_NET_DEAL_VALUES } from "../actions/types";
  
  const initialState = { pending_deal_values:[], won_lost_deal_values:[], cancelled_deal_values:[], net_deal_values:[] };
  
  const reportReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {  
      case GET_PENDING_DEAL_VALUES_WITH_STAGES:
        return { ...state, pending_deal_values: payload };
      case GET_WON_LOST_DEAL_VALUES:
        return { ...state, won_lost_deal_values: payload };
      case GET_CANCELLED_DEAL_VALUES:
        return { ...state, cancelled_deal_values: payload };
      case GET_NET_DEAL_VALUES:
        return { ...state, net_deal_values: payload };
      default:
        return state;
    }
  };
  
  export default reportReducer;
  