import { GET_STAGES,UPDATE_STAGE, SORT_STAGE_CARD, FILTER_STAGE_CARD,SET_STAGE_FILTER_FIELDS } from "../actions/types";
import moment from 'moment';
import { dynamicSort  } from "../../utils/helpers";

const initialState = { list: [], temp_list:[], single: null, card_count:0, filter_fields:null };

const stagesReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_STAGES:
      return { ...state, list: payload.stages, temp_list:payload.stages, card_count:payload.card_count };

    case UPDATE_STAGE:
      return { ...state, list: payload.stages, temp_list:payload.stages, card_count:payload.card_count };

    case SORT_STAGE_CARD:
      return {
        ...state,
        temp_list:state.temp_list.map((l) => {
          if(l.id == payload.stage_id){
            let new_card = l.cards;
            let sort_card = new_card.sort(dynamicSort(payload.sort_by, payload.order_by));
            return {
              ...l,
              cards:sort_card,
            }
          } 
          else{
            return l;
          }        
        })
      };

    case FILTER_STAGE_CARD:
      return {
        ...state,
        temp_list:state.list.map((l) => {
          if(payload.stage && (l.id == payload.stage.value)){

            var filter = { };

            if(payload.contact_name && payload.contact_name.value){
              filter['contact_id'] = payload.contact_name.value;
            }

            if(payload.organization && payload.organization.value){
              filter['organization_id'] = payload.organization.value;
            }

            if(payload.value){
              filter['value'] = payload.value;
            }
            console.log("payload.est_close_date",payload.est_close_date);
            if(payload.est_close_date || payload.est_close_date.length > 0){
              filter['est_close_date'] = payload.est_close_date ;
            }
            console.log("payload.follow_up",payload.follow_up);
            if(payload.follow_up || payload.follow_up.length > 0){
              filter['follow_up'] = payload.follow_up;
            }

            if(payload.responsible){
              filter['responsible'] = payload.responsible;
            }
            
            let cards = l.cards;
            cards= cards.filter(function(item) {
              for (var key in filter) {
                if(['est_close_date','follow_up'].includes(key.toLocaleLowerCase())){
                  let date_field   = item[key];                    
                  let start_date = filter[key][0] ;
                  let end_date = filter[key][1];   

                  var new_start_date = moment(start_date).utcOffset(0);
                  new_start_date.set({hour:0,minute:0,second:0});

                  var new_end_date = moment(end_date).utcOffset(0);
                  new_end_date.set({hour:23,minute:59,second:59});

                  // let new_start_date = new Date(new Date(start_date).setHours("00", "00", "00"));
                  // let new_end_date = new Date(new Date(end_date).setHours("23", "59", "59"));

                  let date_result = moment(date_field).isBetween(start_date, new_end_date);
                  if(!date_result){
                    return false;
                  }
                } 
                
                // if (item[key] === undefined || item[key].toLowerCase().indexOf(filter[key].toLowerCase()) == -1)
                // return false;
              }
              return true;    
            });
            return {
              ...l,
              total_card:cards.length,
              cards:cards,
            }
          } 
          else{
            return l;
          }        
        })
      };
    
    case SET_STAGE_FILTER_FIELDS:
      return {
        ...state,
        filter_fields:payload
      };

    default:
      return state;
  }
};

export default stagesReducer;
