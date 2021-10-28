import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateOrganisation,
} from "../redux/actions/organisation";
import { convertToSlug } from "../utils/helpers";
import { DatePicker  } from 'rsuite';
import moment from 'moment';

function EditOrganisationSide({ closeSideBarFunc }) {
  const dispatch = useDispatch();
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const organisation_fields = useSelector(
    (state) => (state.custom_table_field && state.custom_table_field.organisations) || []
  );
  const detail = useSelector(
    (state) => (state.organisation && state.organisation.edit) || ""
  );
  const singleId = (detail && detail._id) ? detail._id : '';

  console.log("detail:",detail);

  let initOrgField = {
    user: current_user_id,
  };
  const [orgField, setOrgField] = useState(initOrgField);
  const [errors, setErrors] = useState({});
  const [inputDKey, setinputDKey] = useState(Date.now());

  useEffect(() => {
    setFieldDefaultValue();
    return () => {};
  }, []);

  const setFieldDefaultValue = () => {
    if (organisation_fields && organisation_fields.length > 0) {
      let orgg = { ...orgField };
      for (const org1 of organisation_fields) {
        orgg[org1.column_slug] = (detail[org1.column_slug]) ? detail[org1.column_slug] : "";
      }
      setOrgField(orgg);
    }
  };

  const handleChange = (e) => {
    console.log(`e.target:`,e.target.tagName);
    const { name, value } = e.target;
    var selectValue = "";
    if(e.target.tagName === "SELECT"){
      var ref = e.target[e.target.selectedIndex].getAttribute('data-ref');
      console.log("e.target.dataset.ref:",ref);
      selectValue = { ref: ref, value:value };
    }
    else{
      selectValue = value;
    }
    console.log(`name:${name} | value:${value}`);
    setOrgField({ ...orgField, [name]: selectValue });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("orgFieldSubmit:", orgField);
    if (validateForm()) {
        var formData = {
            "data":orgField,
            "_id":singleId,
        }
      dispatch(updateOrganisation(formData));
    }
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;
    if (organisation_fields && organisation_fields.length > 0) {
      let orgg = { ...orgField };
      for (const org1 of organisation_fields) {
        var field_name = convertToSlug(org1.column_name);
        var field_type = org1.column_type;
        var is_required = org1.is_required;
        if(!["label"].includes(field_type.toLowerCase())){
          if(typeof orgField[field_name] == 'object'){
            if (!orgField[field_name]["value"] && is_required) {
              formIsValid = false;
              errors[field_name] = "*field Required.";
            }
          }
          else{
            if (!orgField[field_name].trim() && is_required) {
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
    orgField[column_slug] = (date) ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
  };
  return (
    <>
      <div className="w-100 side-main">
        <div
          className="title p-3"
          style={{ fontSize: "14px", fontWeight: "700" }}
        >
          <span className="detail-heading">Edit Organization</span>
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
            {organisation_fields && organisation_fields.length > 0
              ? organisation_fields.map((org) => (
                  <Fragment key={org._id}>
                    {(() => {
                      let column_type = org.column_type.toLowerCase();
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
                                readOnly={!org.is_editable}
                              />
                              <span className="text-danger">
                                {errors[org.column_slug]}
                              </span>
                            </div>
                          );
                        case "email":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{org.column_name}</label>
                              <input
                                type="email"
                                className="form-control"
                                defaultValue=""
                                name={org.column_slug}
                                onChange={handleChange}
                                value={orgField[org.column_slug]}
                                readOnly={!org.is_editable}
                              />
                              <span className="text-danger">
                                {errors[org.column_slug]}
                              </span>
                            </div>
                          );
                        case "number":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{org.column_name}</label>
                              <input
                                type="number"
                                className="form-control"
                                defaultValue=""
                                name={org.column_slug}
                                onChange={handleChange}
                                value={orgField[org.column_slug]}
                                readOnly={!org.is_editable}
                              />
                              <span className="text-danger">
                                {errors[org.column_slug]}
                              </span>
                            </div>
                          );
                        case "choice":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{org.column_name}</label>
                              <select
                                name={org.column_slug}
                                className="form-control"
                                onChange={handleChange}
                                value={ (orgField[org.column_slug] && orgField[org.column_slug]['value']) ? orgField[org.column_slug]['value'] : orgField[org.column_slug] }
                                disabled={!org.is_editable}
                              >
                                <option data-ref="" value="">Select</option>
                                {org.values && org.values.length > 0
                                  ? org.values.map((data, index) => (
                                    <option data-ref={data.ref} key={`${index}_${org._id}`} value={data.value}>{data.label}</option>
                                    ))
                                  : null}
                              </select>
                              <span className="text-danger">
                                {errors[org.column_slug]}
                              </span>
                            </div>
                          );
                        case "date":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{org.column_name}</label>
                              {/* <input
                                type="date"
                                className="form-control"
                                name={org.column_slug}
                                onChange={handleChange}
                                value={orgField[org.column_slug]}
                              /> */}
                              <DatePicker
                                key={inputDKey}
                                isoWeek
                                format={ (org.column_slug == 'follow_up') ? `YYYY-MM-DD HH:mm` : `YYYY-MM-DD` }
                                style={{ width: "100%" }}
                                placement="auto"
                                size="sm"
                                name={org.column_slug}
                                value={orgField[org.column_slug]}
                                onChange={(date) => {handleDate(date,org.column_slug)}}
                              />
                              <span className="text-danger">{errors[org.column_slug]}</span>
                            </div>
                          )
                        default:
                          return "";
                      }
                    })()}
                  </Fragment>
                ))
              : null}

            {organisation_fields && organisation_fields.length > 0 ? (
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

export default EditOrganisationSide;
