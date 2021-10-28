import React, { useState, useEffect, Fragment } from "react";
import {useSelector, useDispatch} from "react-redux";
import { getDealFields, getContactsOfOrganization } from "../redux/actions/custom_table_field";
import { addDeal, filterDeal, getDeals } from "../redux/actions/deal";
import { setNewDeal } from "../redux/actions/contact";
import { DatePicker  } from 'rsuite';
import moment from 'moment';

function NewDealSide({closeSideBarFunc}) {
  let initDealField = {
    user: useSelector((state) => (state.auth && state.auth.user._id) || '')
  };
  const [dealField, setDealField] = useState(initDealField);
  const [errors, setErrors] = useState({});
  const [inputDKey, setinputDKey] = useState(Date.now());
  const dispatch = useDispatch();  
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const deal_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.deals) || []);
  const contact_new_deal = useSelector((state) => (state.contact && state.contact.new_deal) || "");
  const contact_edit = useSelector((state) => (state.contact && state.contact.edit) || "");
  const filter_fields = useSelector(
    (state) => (state.deal && state.deal.filter_fields) || ""
  );
  const deals = useSelector(
    (state) => (state.deal && state.deal.list) || []
  );

  useEffect(() => {   
    (async () => {
      if(contact_edit._id == contact_new_deal){
        // Get Current Contact based on current org
        let param = { organization:contact_edit.organization };
        await dispatch(getContactsOfOrganization(param));
      }
      else{
        let param = { organization:{ref:"reset", value:""} };
        await dispatch(getContactsOfOrganization(param));
      }
      setFieldDefaultValue();
    })();
  }, [deals, contact_new_deal]);

  const setFieldDefaultValue = () => {
    console.log("setFieldDefaultValue");
    if(deal_fields && deal_fields.length > 0){
      let dealg = {...dealField};
      for (const deal1 of deal_fields) {
        if(['choice','inherit'].includes(deal1.column_type.toLocaleLowerCase())){
          if(contact_edit && contact_new_deal && (contact_edit._id == contact_new_deal)){
            // For Organization 
            if(deal1.column_slug == 'organization' && contact_edit.organization && contact_edit.organization.value){
              dealg[deal1.column_slug] = {ref:'organization', value: contact_edit.organization.value};
            }
            else if(deal1.column_slug == 'contact_name' && contact_edit._id){
              dealg[deal1.column_slug] = {ref:'contact', value:contact_edit._id};
            }
            else if(deal1.column_slug == 'responsible' && contact_edit._id){
              dealg[deal1.column_slug] = {ref:'user', value:current_user_id};
            }
            else{
              dealg[deal1.column_slug] = {ref:'', value:''};
            }
          }
          else{
            dealg[deal1.column_slug] = {ref:'', value:''};
          }
        }
        else{
          if(!['label'].includes(deal1.column_type.toLocaleLowerCase())){
            dealg[deal1.column_slug] = '';
          }
        }
      }
      setDealField(dealg);
    }
  }

  const handleChange = async(e) => {
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
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log('dealFieldSubmit:',dealField);
    if (validateForm()) {
      await dispatch(addDeal(dealField));
      await dispatch(setNewDeal(null));
      // setFieldDefaultValue();
      if(filter_fields){      
        let param = {
          formField:filter_fields,
          other:{sort_by:"updated_at", order_by:'desc'},
        };  
        await dispatch(filterDeal(param, false));
      }
      else{
        let param = {
          sort_by:'updated_at',
          order_by:'desc',
          user_id: current_user_id,
          deal_user: current_user_id,
        }
        await dispatch(getDeals(param));
      }
      scrollToTop();
    }
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;
    if(deal_fields && deal_fields.length > 0){
      for (const deal1 of deal_fields) {
        var field_name = deal1.column_slug;
        var field_type = deal1.column_type;
        var is_required = deal1.is_required;

        if(!["label"].includes(field_type.toLowerCase())){
          if(typeof dealField[field_name] == 'object'){
            if (!dealField[field_name]["value"] && is_required) {
              formIsValid = false;
              errors[field_name] = "*field Required.";
            }
          }
          else{
            if (!dealField[field_name].trim() && is_required) {
              formIsValid = false;
              errors[field_name] = "*field Required.";
            }
          }
        }        
      }
    }
    console.log("errors:",errors);
    setErrors(errors);
    return formIsValid;
  };

  const handleDate = (date,column_slug) => {
    setinputDKey(Date.now());
    dealField[column_slug] = (date) ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
  };

  const cancelNewDeal = (e) => {
    e.preventDefault();
    dispatch(setNewDeal(null));
    closeSideBarFunc();
  };

  const scrollToTop = () => {
    // Scroll to top
    var elmnt = document.getElementById("dataTable");
    elmnt.scrollIntoView();
  }
  return (
    <>
      <div className="w-100 side-main">
        <div
          className="title p-3"
          style={{ fontSize: "14px", fontWeight: "700" }}
        >
          <span className="detail-heading">Create Deal</span>
          <span className="float-right edit-close">
            <i
              className="fas fa-times grey"
              onClick={cancelNewDeal}
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
                          <span className="text-danger">
                            {errors[deal.column_slug]}
                          </span>
                        </div>
                      );
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
                          <span className="text-danger">
                            {errors[deal.column_slug]}
                          </span>
                        </div>
                      );
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
                          <span className="text-danger">
                            {errors[deal.column_slug]}
                          </span>
                        </div>
                      );

                    case "choice":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{deal.column_name}</label>
                          <select
                            name={deal.column_slug}
                            className="form-control"
                            onChange={handleChange}
                            value={
                              dealField[deal.column_slug] &&
                              dealField[deal.column_slug]["value"]
                                ? dealField[deal.column_slug]["value"]
                                : dealField[deal.column_slug]
                            }
                          >
                            <option data-ref="" value="">
                              Select
                            </option>
                            {deal.values && deal.values.length > 0
                              ? deal.values.map((data, index) => (
                                  <option
                                    data-ref={data.ref}
                                    key={`${index}_${deal._id}`}
                                    value={data.value}
                                  >
                                    {data.label}
                                  </option>
                                ))
                              : null}
                          </select>
                          <span className="text-danger">
                            {errors[deal.column_slug]}
                          </span>
                        </div>
                      );

                    case "inherit":                  
                      return (deal.column_slug && deal.column_slug == 'contact_name') ? 
                      (
                        <div className="form-group">
                          <label htmlFor="">{deal.column_name}</label>
                          <select
                            name={deal.column_slug}
                            className="form-control"
                            onChange={handleChange}
                            value={
                              dealField[deal.column_slug] &&
                              dealField[deal.column_slug]["value"]
                                ? dealField[deal.column_slug]["value"]
                                : dealField[deal.column_slug]
                            }
                          >
                            <option data-ref="" value="">
                              Select
                            </option>
                            {deal.values && deal.values.length > 0
                              ? deal.values.map((data, index) => (
                                  <option
                                    data-ref={data.ref}
                                    key={`${index}_${deal._id}`}
                                    value={data.value}
                                  >
                                    {data.label}
                                  </option>
                                ))
                              : null}
                          </select>
                          <span className="text-danger">
                            {errors[deal.column_slug]}
                          </span>
                        </div>
                      )
                      : (
                      <div className="form-group">
                        <label htmlFor="">{deal.column_name}</label>
                        <select
                          name={deal.column_slug}
                          className="form-control"
                          onChange={handleChange}
                          value={
                            dealField[deal.column_slug] &&
                            dealField[deal.column_slug]["value"]
                              ? dealField[deal.column_slug]["value"]
                              : dealField[deal.column_slug]
                          }
                        >
                          <option data-ref="" value="">
                            Select
                          </option>
                          {deal.values && deal.values.length > 0
                            ? deal.values.map((data, index) => (
                                <option
                                  data-ref={data.ref}
                                  key={`${index}_${deal._id}`}
                                  value={data.value}
                                >
                                  {data.label}
                                </option>
                              ))
                            : null}
                        </select>
                        <span className="text-danger">
                          {errors[deal.column_slug]}
                        </span>
                      </div>
                    )                      

                    case "date":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{deal.column_name}</label>
                          <DatePicker
                            key={inputDKey}
                            isoWeek
                            format={ (deal.column_slug == 'follow_up') ? `DD-MM-YYYY HH:mm` : `DD-MM-YYYY` }
                            style={{ width: "100%" }}
                            placement="auto"
                            size="sm"
                            name={deal.column_slug}
                            value={dealField[deal.column_slug]}
                            onChange={(date) => {handleDate(date,deal.column_slug)}}
                          />

                          <span className="text-danger">
                            {errors[deal.column_slug]}
                          </span>
                        </div>
                      );
                    default:
                      return "";
                  }
                  })()}
                  </Fragment>
                )
                ) : null}

            {deal_fields && deal_fields.length > 0 ? 
            (
              <div className="org-btn-group">
                <button type="button" onClick={cancelNewDeal} className="btn btn-md btn-outline-dark">Cancel</button>
                <button type="submit" className="btn btn-md btn-orange btn-o float-right">Save</button>
              </div>
            ) : null
            }            
          </form>
        </div>
      </div>
    </>
  );
}

export default NewDealSide;
