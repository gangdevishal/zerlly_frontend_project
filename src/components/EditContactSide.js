import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateContact,
} from "../redux/actions/contact";
import { convertToSlug } from "../utils/helpers";
import { DatePicker  } from 'rsuite';
import moment from 'moment';

function EditContactSide({ closeSideBarFunc }) {
  const dispatch = useDispatch();
  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const contact_fields = useSelector(
    (state) => (state.custom_table_field && state.custom_table_field.contacts) || []
  );
  const detail = useSelector(
    (state) => (state.contact && state.contact.edit) || ""
  );
  const singleId = (detail && detail._id) ? detail._id : '';

  console.log("detail:",detail);

  let initContactField = {
    user: current_user_id,
  };
  const [contactField, setContactField] = useState(initContactField);
  const [errors, setErrors] = useState({});
  const [inputDKey, setinputDKey] = useState(Date.now());

  useEffect(() => {
    setFieldDefaultValue();
    return () => {};
  }, []);

  const setFieldDefaultValue = () => {
    if (contact_fields && contact_fields.length > 0) {
      let contactg = { ...contactField };
      for (const contact1 of contact_fields) {
        contactg[convertToSlug(contact1.column_name)] = (detail[convertToSlug(contact1.column_name)]) ? detail[convertToSlug(contact1.column_name)] : "";
      }
      setContactField(contactg);
    }
  };

  const handleChange = (e) => {
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
    setContactField({ ...contactField, [name]: selectValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("contactFieldSubmit:", contactField);
    if (validateForm()) {
        var formData = {
            "data":contactField,
            "_id":singleId,
        }
      dispatch(updateContact(formData));
    }
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;
    if (contact_fields && contact_fields.length > 0) {
      for (const contact1 of contact_fields) {
        var field_name = convertToSlug(contact1.column_name);
        var field_type = contact1.column_type;
        var is_required = contact1.is_required;
        if(!["label"].includes(field_type.toLowerCase())){
          if(typeof contactField[field_name] == 'object'){
            if (!contactField[field_name]["value"] && is_required) {
              formIsValid = false;
              errors[field_name] = "*field Required.";
            }
          }
          else{
            if (!contactField[field_name].trim() && is_required) {
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
    contactField[column_slug] = (date) ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
  };
  return (
    <>
      <div className="w-100 side-main">
        <div
          className="title p-3"
          style={{ fontSize: "14px", fontWeight: "700" }}
        >
          <span className="detail-heading">Edit Contact</span>
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
            {contact_fields && contact_fields.length > 0
              ? contact_fields.map((contact) => (
                  <Fragment key={contact._id}>
                    {(() => {
                      let column_type = contact.column_type.toLowerCase();
                      switch (column_type) {
                        case "text":
                        case "phone":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{contact.column_name}</label>
                              <input
                                type="text"
                                className="form-control"
                                name={contact.column_slug}
                                onChange={handleChange}
                                value={contactField[contact.column_slug]}
                                readOnly={!contact.is_editable}
                              />
                              <span className="text-danger">
                                {errors[contact.column_slug]}
                              </span>
                            </div>
                          );
                        case "email":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{contact.column_name}</label>
                              <input
                                type="email"
                                className="form-control"
                                defaultValue=""
                                name={contact.column_slug}
                                onChange={handleChange}
                                value={contactField[contact.column_slug]}
                                readOnly={!contact.is_editable}
                              />
                              <span className="text-danger">
                                {errors[contact.column_slug]}
                              </span>
                            </div>
                          );
                        case "number":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{contact.column_name}</label>
                              <input
                                type="number"
                                className="form-control"
                                defaultValue=""
                                name={contact.column_slug}
                                onChange={handleChange}
                                value={contactField[contact.column_slug]}
                                readOnly={!contact.is_editable}
                              />
                              <span className="text-danger">
                                {errors[contact.column_slug]}
                              </span>
                            </div>
                          );
                        case "choice":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{contact.column_name}</label>
                              <select
                                name={contact.column_slug}
                                className="form-control"
                                onChange={handleChange}
                                value={ (contactField[contact.column_slug] && contactField[contact.column_slug]['value']) ? contactField[contact.column_slug]['value'] : contactField[contact.column_slug] }
                                disabled={!contact.is_editable}
                              >
                                <option data-ref="" value="">Select</option>
                                {contact.values && contact.values.length > 0
                                  ? contact.values.map((data, index) => (
                                    <option data-ref={data.ref} key={`${index}_${contact._id}`} value={data.value}>{data.label}</option>
                                    ))
                                  : null}
                              </select>
                              <span className="text-danger">
                                {errors[contact.column_slug]}
                              </span>
                            </div>
                          );
                        
                        
                        case "inherit":                    
                          return (
                            <div className="form-group">
                              <label htmlFor="">{contact.column_name}</label>
                              <select name={contact.column_slug} className="form-control"  onChange={handleChange} 
                              value={ (contactField[contact.column_slug] && contactField[contact.column_slug]['value']) ? contactField[contact.column_slug]['value'] : contactField[contact.column_slug] }>
                                <option data-ref="" value="">Select</option>
                                {
                                  (contact.values && contact.values.length > 0 ?
                                    contact.values.map((data,index) => (
                                      <option data-ref={data.ref} key={`${index}_${contact._id}`} value={data.value}>{data.label}</option>
                                    ))
                                  : null)
                                }
                              </select>
                              <span className="text-danger">{errors[contact.column_slug]}</span>
                            </div>
                          )

                        case "date":
                          return (
                            <div className="form-group">
                              <label htmlFor="">{contact.column_name}</label>
                              {/* <input
                                type="date"
                                className="form-control"
                                defaultValue=""
                                name={contact.column_slug}
                                onChange={handleChange}
                                value={contactField[contact.column_slug]}
                              /> */}
                              <DatePicker
                                key={inputDKey}
                                isoWeek
                                format={ (contact.column_slug == 'follow_up') ? `YYYY-MM-DD HH:mm` : `YYYY-MM-DD` }
                                style={{ width: "100%" }}
                                placement="auto"
                                size="sm"
                                name={contact.column_slug}
                                value={contactField[contact.column_slug]}
                                onChange={(date) => {handleDate(date,contact.column_slug)}}
                              />
                              <span className="text-danger">{errors[contact.column_slug]}</span>
                            </div>
                          )
                        default:
                          return "";
                      }
                    })()}
                  </Fragment>
                ))
              : null}

            {contact_fields && contact_fields.length > 0 ? (
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

export default EditContactSide;
