import {
  GET_ORGANISATION_FIELDS,
  GET_CONTACT_FIELDS,
  GET_DEAL_FIELDS,
  GET_ORGANIZATION_CONTACTS
} from "../actions/types";

const initialState = { organisations: [], contacts: [], deals: [] };

const postsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_ORGANISATION_FIELDS:
      return { ...state, organisations: payload };
    case GET_CONTACT_FIELDS:
      return { ...state, contacts: payload };
    case GET_DEAL_FIELDS:
      return { ...state, deals: payload };

    case GET_ORGANIZATION_CONTACTS:
      return { 
        ...state, 
        deals: state.deals.map((deal)=> {
          if(deal.column_slug === "contact_name"){
            return {
              ...deal,
              values:payload,
            }
          }
          else{
            return deal;
          }
        }),
      };

    default:
      return state;
  }
};

export default postsReducer;
