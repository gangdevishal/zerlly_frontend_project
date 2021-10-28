import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOrganisationFields } from "../redux/actions/custom_table_field";
import { getOrganisations, filterOrganisation, setFilterFields } from "../redux/actions/organisation";
import { convertToSlug, DateStaticRanges } from "../utils/helpers";
import { DateRangePicker } from 'rsuite';
import moment from 'moment';
const dateFns = require('date-fns');

// Organisations Sidebar Action
function FilterOrganisationSide({ closeSideBarFunc,activateFilter }) {

  let initOrgField = {
  };
  const [orgField, setOrgField] = useState(initOrgField);
  const [errors, setErrors] = useState({});
  const [inputDKey, setinputDKey] = useState(Date.now());
  const dispatch = useDispatch();

  var current_user_id = useSelector((state) => (state.auth && state.auth.user._id) || "");
  const organisation_fields = useSelector(
    (state) =>
      (state.custom_table_field && state.custom_table_field.organisations) || []
  );
  const filter_fields = useSelector(
    (state) =>
      (state.organisation && state.organisation.filter_fields) || ""
  );

  useEffect(() => {
    // dispatch(getOrganisationFields());
    setFieldDefaultValue();
    return () => {};
  }, []);

  const setFieldDefaultValue = () => {
    if (organisation_fields && organisation_fields.length > 0) {
      let orgg = { ...orgField };
      for (const org1 of organisation_fields) {
        let column_slug = org1.column_slug;
        orgg[column_slug] = (filter_fields && filter_fields[column_slug]) ? filter_fields[column_slug] : "";
      }
      setOrgField(orgg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    var selectValue = "";
    if(e.target.tagName === "SELECT" && value){
      var ref = e.target[e.target.selectedIndex].getAttribute('data-ref');
      console.log("e.target.dataset.ref:",ref);
      selectValue = { ref: ref, value:value };
    }
    else{
      selectValue = value;
    }
    console.log(`name:${name} | value:${value}`);
    setOrgField({ ...orgField, [name]: selectValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("orgFieldSubmit:", orgField);
    let param = {
      formField:orgField,
      other:{sort_by:"updated_at", order_by:'desc'},
    };
    dispatch(filterOrganisation(param));
    dispatch(setFilterFields(orgField));   
    closeSideBarFunc();
    activateFilter(true);
  };

  const clearFilter = (e) => {
    e.preventDefault();
    setFieldDefaultValue();
    dispatch(setFilterFields(null));
    let param = {user_id:current_user_id,sort_by:"updated_at",order_by:"desc"};
    dispatch(getOrganisations(param));
    setinputDKey(Date.now());
    closeSideBarFunc();
    activateFilter(false);
  };

  const handleDate = (date,column_slug) => {
    console.log("datefff:",date," | column_slug:",column_slug);
    let new_date = [];
    for (const dt of date) {
      new_date.push(moment(dt).format("YYYY-MM-DD"));
    }
    orgField[column_slug] = (new_date.length > 0) ? new_date : '';
    console.log("new_date:",new_date);
  };
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
            {organisation_fields && organisation_fields.length > 0
              ? 
              organisation_fields.map((org) => (
                <Fragment key={org._id}>
                {(() => {
                  let column_type = org.column_type.toLowerCase();
                  
                  if(org.is_filterable){

                    switch (column_type) {
                    case "text":
                    case "phone":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{org.column_name}</label>
                          <input
                            type="text"
                            className="form-control"
                            name={org.column_slug}
                            onChange={handleChange}
                            value={orgField[org.column_slug]}
                          />
                          <span className="text-danger">{errors[org.column_slug]}</span>
                        </div>
                      )
                    case "email":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{org.column_name}</label>
                          <input
                            type="email"
                            className="form-control"
                            name={org.column_slug}
                            onChange={handleChange}
                            value={orgField[org.column_slug]}
                          />
                          <span className="text-danger">{errors[org.column_slug]}</span>
                        </div>
                      )
                    case "number":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{org.column_name}</label>
                          <input
                            type="number"
                            className="form-control"
                            name={org.column_slug}
                            onChange={handleChange}
                            value={orgField[org.column_slug]}
                          />
                          <span className="text-danger">{errors[org.column_slug]}</span>
                        </div>
                      )
                    case "choice":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{org.column_name}</label>
                          <select name={org.column_slug} className="form-control"  onChange={handleChange} 
                          value={ (orgField[org.column_slug] && orgField[org.column_slug]['value']) ? orgField[org.column_slug]['value'] : orgField[org.column_slug] }
                          >
                            <option data-ref="" value="">Select</option>
                            {
                              (org.values && org.values.length > 0 ?
                                org.values.map((data,index) => (
                                  <option data-ref={data.ref} key={`${index}_${org._id}`} value={data.value}>{data.label}</option>
                                ))
                               : null)
                            }
                          </select>
                          <span className="text-danger">{errors[org.column_slug]}</span>
                        </div>
                      )
                    case "date":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{org.column_name}</label>
                          <DateRangePicker
                            key={inputDKey}
                            isoWeek
                            format="YYYY-MM-DD"
                            style={{ width: "100%" }}
                            placement="auto"
                            onChange={(date) => {handleDate(date,org.column_slug)}}
                            onClean={(e)=>{ orgField[org.column_slug] = ""; }}
                            name={org.column_slug}
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
                          <span className="text-danger">{errors[org.column_slug]}</span>
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

            {organisation_fields && organisation_fields.length > 0 ? 
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
export default FilterOrganisationSide;
