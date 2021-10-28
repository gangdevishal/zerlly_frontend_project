import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateDeal } from "../redux/actions/deal";
import { getStages } from "../redux/actions/stage";
import { getContactsOfOrganization } from "../redux/actions/custom_table_field";
import { DatePicker  } from 'rsuite';
import moment from 'moment';

function EditDealSide({ closeSideBarFunc }) {
  const dispatch = useDispatch();
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const deal_fields = useSelector(
    (state) => (state.custom_table_field && state.custom_table_field.deals) || []
  );
  const detail = useSelector(
    (state) => (state.deal && state.deal.edit) || ""
  );
  const singleId = (detail && detail._id) ? detail._id : '';

  console.log("detail:",detail);

  let initDealField = {
    user: current_user_id,
  };
  const [dealField, setDealField] = useState(initDealField);
  const [errors, setErrors] = useState({});
  const [inputDKey, setinputDKey] = useState(Date.now());


  useEffect(() => {
    setFieldDefaultValue();     
    if(detail && detail.organization){
      // Get Current Contact based on current org
      let param = { organization:detail.organization };
      dispatch(getContactsOfOrganization(param));
    } 
  }, []);

  useEffect(() => {
    // setFieldDefaultValue();
  }, [detail]);

  const setFieldDefaultValue = () => {
    if (deal_fields && deal_fields.length > 0) {
      let dealg = { ...dealField };
      for (const deal1 of deal_fields) {
        dealg[deal1.column_slug] = (detail[deal1.column_slug]) ? detail[deal1.column_slug] : "";
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
        dealField['contact_name']['ref'] = '';
        dealField['contact_name']['value'] = '';
        let param = { organization:{ref, value} };
        dispatch(getContactsOfOrganization(param));
      }
      else if(name === 'organization' && ref==""){
        dealField['contact_name']['ref'] = '';
        dealField['contact_name']['value'] = '';
        let param = { organization:{ref:"reset", value} };
        dispatch(getContactsOfOrganization(param));
      }
    }
    else{
      selectValue = value;
    }
    console.log(`name:${name} | value:${value}`);
    setDealField({ ...dealField, [name]: selectValue });
    
    // Change Contact Data based on Organisation
    // if(name === 'organization'){
    //   let param = {org_id :value};
    //   console.log('param:',param);
    //   dispatch(getContacts(param));
    // }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("dealFieldSubmit:", dealField);
    if (validateForm()) {
        var formData = {
            "data":dealField,
            "_id":singleId,
        }
      await dispatch(updateDeal(formData));
      let param = {
        user_id:current_user_id,
        deal_user:current_user_id,
        sort:"asc",
      }
      console.log("param:",param);
      await dispatch(getStages(param));
    }
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;
    if (deal_fields && deal_fields.length > 0) {
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
    console.log("errors:", errors);
    setErrors(errors);
    return formIsValid;
  };

  const handleDate = (date,column_slug) => {
    setinputDKey(Date.now());
    dealField[column_slug] = (date) ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
  };

  return (
    <>
      <div className="w-100 side-main">
        <div
          className="title p-3"
          style={{ fontSize: "14px", fontWeight: "700" }}
        >
          <span className="detail-heading">Edit Deal</span>
          <span className="float-right edit-close">
            <i
              className="fas fa-times grey"
              onClick={() => closeSideBarFunc()}
              style={{ cursor: "pointer" }}
            />
          </span>
        </div>
        <div className="org-form p-3">
          <form onSubmit={handleSubmit}>
            {deal_fields && deal_fields.length > 0
              ? deal_fields.map((deal) => (
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
                                name={deal.column_slug}
                                onChange={handleChange}
                                value={dealField[deal.column_slug]}
                                readOnly={!deal.is_editable}
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
                                readOnly={!deal.is_editable}
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
                                readOnly={!deal.is_editable}
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
                                value={ (dealField[deal.column_slug] && dealField[deal.column_slug]['value']) ? dealField[deal.column_slug]['value'] : dealField[deal.column_slug] }
                                disabled={!deal.is_editable}
                              >
                                <option data-ref="" value="">Select</option>
                                {deal.values && deal.values.length > 0
                                  ? deal.values.map((data, index) => (
                                    <option data-ref={data.ref} key={`${index}_${deal._id}`} value={data.value}>{data.label}</option>
                                    ))
                                  : null}
                              </select>
                              <span className="text-danger">
                                {errors[deal.column_slug]}
                              </span>
                            </div>
                          );
                        
                        
                        case "inherit":                    
                          return (
                            <div className="form-group">
                              <label htmlFor="">{deal.column_name}</label>
                              <select name={deal.column_slug} className="form-control"  onChange={handleChange} 
                              value={ (dealField[deal.column_slug] && dealField[deal.column_slug]['value']) ? dealField[deal.column_slug]['value'] : dealField[deal.column_slug] }>
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
                              <span className="text-danger">{errors[deal.column_slug]}</span>
                            </div>
                          )
                        default:
                          return "";
                      }
                    })()}
                  </Fragment>
                ))
              : null}

            {deal_fields && deal_fields.length > 0 ? (
              <div className="org-btn-group">
                <button
                  type="button"
                  onClick={() => closeSideBarFunc()}
                  className="btn btn-md btn-outline-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-md btn-orange btn-o float-right"
                >
                  Save
                </button>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </>
  );
}

export default EditDealSide;
