import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getContactsOfOrganization } from "../redux/actions/custom_table_field";
import { getStages, filterSalesboardDeal, setFilterFields } from "../redux/actions/stage";
import { DateStaticRanges } from "../utils/helpers";
import { DateRangePicker,TagPicker } from 'rsuite';
import moment, { now } from 'moment';
const dateFns = require('date-fns');

// Deals Sidebar Action
function FilterSalesboardSide({ selectedStageData, closeSideBarFunc, activateFilter }) {
  console.log("here:",selectedStageData);
  var current_user_id = useSelector((state) => (state.auth && state.auth.user._id) || "");

  let initDealField = {
    user_id:current_user_id
  };
  const [dealField, setDealField] = useState(initDealField);
  const [errors, setErrors] = useState({});
  const [inputDKey, setinputDKey] = useState(Date.now());
  var inputDKey2 = now();
  const dispatch = useDispatch();

  const deal_fields = useSelector(
    (state) =>
      (state.custom_table_field && state.custom_table_field.deals) || []
  );
  const filter_fields = useSelector(
    (state) =>
      (state.stage && state.stage.filter_fields) || ""
  );
  useEffect(() => {
    setFieldDefaultValue();
  }, [selectedStageData]);

  const setFieldDefaultValue = () => {
    if (deal_fields && deal_fields.length > 0) {
      let dealg = { ...dealField };
      for (const deal1 of deal_fields) {
        // if(['choice','inherit','label'].includes(deal1.column_type.toLocaleLowerCase())){
        //   dealg[deal1.column_slug] = {ref:'', value:''};
        //   if(selectedStageData && selectedStageData.ref == "stage" && deal1.column_slug == 'stage'){
        //     // dealg[deal1.column_slug] = selectedStageData;
        //   }  
        // }
        // else{
        //   dealg[deal1.column_slug] = '';
        // }
        let column_slug = deal1.column_slug;
        dealg[column_slug] = (filter_fields && filter_fields[column_slug]) ? filter_fields[column_slug] : "";
      }
      setDealField(dealg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    var selectValue = "";
    if(e.target.tagName === "SELECT"){
      var ref = e.target[e.target.selectedIndex].getAttribute('data-ref');
      console.log("e.target.dataset.ref:",ref);
      selectValue = { ref: ref, value:value };    
      // Check if dropdown is organization
      if(name === 'organization' && ref !==""){
        let param = { organization:{ref, value} };
        dispatch(getContactsOfOrganization(param));
      }
      else if(name === 'organization' && ref==""){
        let param = { organization:{ref:"reset", value} };
        dispatch(getContactsOfOrganization(param));
      }
    }
    else{
      selectValue = value;
    }
    console.log(`name:${name} | value:${value}`);
    setDealField({ ...dealField, [name]: selectValue });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("dealFieldSubmit:", dealField);
    // dispatch(filterSalesboardCard(dealField));
    dispatch(filterSalesboardDeal(dealField));  
    dispatch(setFilterFields(dealField));
    activateFilter(true);
    closeSideBarFunc();
  };

  const clearFilter = async(e) => {
    e.preventDefault();
    setFieldDefaultValue();
    dispatch(setFilterFields(null));
    getStageWithCards();
    let param2 = { organization:{ref:'old', value:""} };
    dispatch(getContactsOfOrganization(param2));
    setinputDKey(Date.now());
    activateFilter(false);
    closeSideBarFunc();
  };

  const getStageWithCards = async() => {
    let param = {
      user_id:current_user_id,
      sort:"desc",
      deal_user:current_user_id,
    }
    console.log("param:",param);
    await dispatch(getStages(param));
  }

  const handleDate = (date,column_slug) => {
    console.log("datefff:",date," | column_slug:",column_slug);
    let new_date = [];
    for (const dt of date) {
      new_date.push(moment(dt).format("YYYY-MM-DD"));
    }
    dealField[column_slug] = (new_date.length > 0) ? new_date : '';
    console.log("new_date:",new_date);
  };

  const handleSelectChange = (column_slug) => (value,event) => {
    dealField[column_slug] = (value) ? value : "";
  }

  return (
    <>
      <div className="w-100 side-main">
        <div
          className="title p-3"
          style={{ fontSize: "14px", fontWeight: "700" }}
        >
          <span className="detail-heading">Filter</span>
          <span className="float-right edit-close">
            <i
              className="fas fa-times grey"
              onClick={() => closeSideBarFunc()}
              style={{ cursor: "pointer" }}
            />
          </span>
        </div>
        <div className="org-form p-3">
        <form  onSubmit={handleSubmit}>
            {deal_fields && deal_fields.length > 0
              ? 
              deal_fields.map((deal) => (
                <Fragment key={deal._id}>
                {(() => {
                  let column_type = deal.column_type.toLowerCase();
                  
                  if(deal.is_filterable){

                    switch (column_type) {
                    case "text":
                    case "phone":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{deal.column_name}</label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue=""
                            name={deal.column_slug}
                            onChange={handleChange}
                            value={dealField[deal.column_slug]}
                          />
                          <span className="text-danger">{errors[deal.column_slug]}</span>
                        </div>
                      )
                    case "email":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{deal.column_name}</label>
                          <input
                            type="email"
                            className="form-control"
                            defaultValue=""
                            name={deal.column_slug}
                            onChange={handleChange}
                            value={dealField[deal.column_slug]}
                          />
                          <span className="text-danger">{errors[deal.column_slug]}</span>
                        </div>
                      )
                    case "number":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{deal.column_name}</label>
                          <input
                            type="number"
                            className="form-control"
                            defaultValue=""
                            name={deal.column_slug}
                            onChange={handleChange}
                            value={dealField[deal.column_slug]}
                          />
                          <span className="text-danger">{errors[deal.column_slug]}</span>
                        </div>
                      )
                    
                      case "choice":
                        return (
                          <div className="form-group">
                            <label htmlFor="">{deal.column_name}</label>
                            <select name={deal.column_slug} className="form-control"  onChange={handleChange} 
                            value={ (dealField[deal.column_slug] && dealField[deal.column_slug]['value']) ? dealField[deal.column_slug]['value'] : dealField[deal.column_slug] }
                            >
                              <option data-ref="" value="">Select</option>
                              {
                                (deal.values && deal.values.length > 0 ?
                                  deal.values.map((data,index) => (
                                    <option data-ref={data.ref} key={`${index}_${deal._id}`} value={data.value}>{data.label}</option>
                                  ))
                                : null)
                              }
                            </select>
                            <span className="text-danger">{errors[deal.column_slug]}</span>
                          </div>
                        )

                      case "inherit":
                        return (
                          <div className="form-group">
                            <label htmlFor="">{deal.column_name}</label>
                            {deal.column_slug == "responsible" ? (
                              <TagPicker
                                size="sm"
                                name={deal.column_slug} 
                                defaultValue={dealField[deal.column_slug] ? dealField[deal.column_slug] : []}     
                                data={deal.values}
                                block
                                key={inputDKey2}
                                onChange={handleSelectChange(deal.column_slug)}
                                style={{ width: 300 }}
                              />
                            ) : (
                            <select name={deal.column_slug} className="form-control"  onChange={handleChange} 
                            value={ (dealField[deal.column_slug] && dealField[deal.column_slug]['value']) ? dealField[deal.column_slug]['value'] : dealField[deal.column_slug] }
                            >
                              <option data-ref="" value="">Select</option>
                              {
                                (deal.values && deal.values.length > 0 ?
                                  deal.values.map((data,index) => (
                                    <option data-ref={data.ref} key={`${index}_${deal._id}`} value={data.value}>{data.label}</option>
                                  ))
                                : null)
                              }
                            </select>
                            )}
                            <span className="text-danger">{errors[deal.column_slug]}</span>
                          </div>
                        )

                        case "label":
                        return (
                          <div className="form-group">
                            <label htmlFor="">{deal.column_name}</label>
                            <select name={deal.column_slug} className="form-control"  onChange={handleChange} 
                            value={ (dealField[deal.column_slug] && dealField[deal.column_slug]['value']) ? dealField[deal.column_slug]['value'] : dealField[deal.column_slug] }
                            >
                              <option value="">Select</option>
                              {
                                (deal.values && deal.values.length > 0 ?
                                  deal.values.map((data,index) => (
                                    <option data-ref={data.ref} key={`${index}_${deal._id}`} value={data.value}>{data.label}</option>
                                  ))
                                : null)
                              }
                            </select>
                            <span className="text-danger">{errors[deal.column_slug]}</span>
                          </div>
                        )
                      
                      case "date":
                        return (
                          <div className="form-group">
                            <label htmlFor="">{deal.column_name}</label>
                            {/* <input
                              type="date"
                              className="form-control"
                              name={deal.column_slug}
                              onChange={handleChange}
                              value={dealField[deal.column_slug]}
                            /> */}
                            <DateRangePicker
                              key={inputDKey}
                              isoWeek
                              format="YYYY-MM-DD"
                              style={{ width: "100%" }}
                              placement="auto"
                              // onChange={(date) => {
                              //   console.log("Selected:", date);
                              //   dealField[deal.column_slug] = date;
                              // }}
                              onChange={(date) => {handleDate(date,deal.column_slug)}}
                              onClean={(e)=>{ dealField[deal.column_slug] = ""; }}
                              name={deal.column_slug}
                              ranges={DateStaticRanges}
                              size="sm"
                              placeholder="DD-MM-YYYY to DD-MM-YYYY"
                              renderValue={(value) => {
                                console.log("value:", value);
                                return `${dateFns.format(
                                  value[0],
                                  "dd-MM-yyyy"
                                )} to ${dateFns.format(
                                  value[1],
                                  "dd-MM-yyyy"
                                )}`;
                              }}
                            />
                            <span className="text-danger">{errors[deal.column_slug]}</span>
                          </div>
                        )
                    default:
                      return "";
                    }
                  }                  
                  })()}
                  </Fragment>
                )
                ) : null}

            {deal_fields && deal_fields.length > 0 ? 
            (
              <div className="org-btn-group">
                <button type="button" onClick={clearFilter} className="btn btn-md btn-outline-dark">Clear All</button>
                <button type="submit" className="btn btn-md btn-orange btn-o float-right">Apply</button>
              </div>
            ) : null
            }
            
          </form>
        </div>
      </div>
    </>
  );
}
export default FilterSalesboardSide;
