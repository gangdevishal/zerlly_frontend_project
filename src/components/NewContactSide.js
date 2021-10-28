import React, { useState, useEffect, Fragment } from "react";
import {useSelector, useDispatch} from "react-redux";
import { getContactFields } from "../redux/actions/custom_table_field";
import { addContact, filterContact, getContacts } from "../redux/actions/contact";
import { convertToSlug } from "../utils/helpers";
import { DatePicker  } from 'rsuite';
import moment from 'moment';

function NewContactSide({closeSideBarFunc}) {
  let initContactField = {
    user: useSelector((state) => (state.auth && state.auth.user._id) || '')
  };
  const [contactField, setContactField] = useState(initContactField);
  const [errors, setErrors] = useState({});
  const [inputDKey, setinputDKey] = useState(Date.now());
  const dispatch = useDispatch();  

  const contact_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.contacts) || []);
  const contacts = useSelector((state) => (state.contact && state.contact.list) || []);
  const filter_fields = useSelector(
    (state) => (state.contact && state.contact.filter_fields) || ""
  );

  useEffect(() => {
    setFieldDefaultValue();
    return () => {  }
  }, []);

  const setFieldDefaultValue = () => {
    if(contact_fields && contact_fields.length > 0){
      let contactg = {...contactField};
      for (const contact1 of contact_fields) {
        if(['choice','inherit'].includes(contact1.column_type.toLocaleLowerCase())){
          contactg[contact1.column_slug] = {ref:'', value:''};
        }
        else{
          contactg[contact1.column_slug] = '';
        }
      }
      setContactField(contactg);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    var selectValue = "";
    if(e.target.tagName === "SELECT"){
      var ref = e.target[e.target.selectedIndex].getAttribute('data-ref');
      var country_id_ref = e.target[e.target.selectedIndex].getAttribute('data-country_id');
      var country_name_ref = e.target[e.target.selectedIndex].getAttribute('data-country_name');

      console.log("e.target.dataset.ref:",ref);
      console.log("country_ref:",country_id_ref);
      selectValue = { ref: ref, value:value };

      // Check if dropdown is organization
      if(ref === 'organization'){
        // Set Country Value
        if(country_id_ref){
          contactField["country"] = { ref: "country", value:country_id_ref};
        }
      }
    }
    else{
      selectValue = value;
    }
    console.log(`name:${name} | value:${value}`);
    setContactField({ ...contactField, [name]: selectValue });
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log('contactFieldSubmit:',contactField);
    if (validateForm()) {
      await dispatch(addContact(contactField));
      setFieldDefaultValue();
      if(filter_fields){      
        let param = {
          formField:filter_fields,
          other:{sort_by:"updated_at", order_by:'desc'},
        };  
        await dispatch(filterContact(param, false));
      }
      else{
        let param = {
          sort_by:'updated_at',
          order_by:'desc',
        }
        await dispatch(getContacts(param));
      }
      scrollToTop();
    }
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;
    if(contact_fields && contact_fields.length > 0){
      let contactg = {...contactField};
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
    console.log("errors:",errors);
    setErrors(errors);
    return formIsValid;
  };

  const handleDate = (date,column_slug) => {
    setinputDKey(Date.now());
    contactField[column_slug] = (date) ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
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
          <span className="detail-heading">Create Contact</span>
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
            {contact_fields && contact_fields.length > 0
              ? 
              contact_fields.map((contact) => (
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
                          />
                          <span className="text-danger">{errors[contact.column_slug]}</span>
                        </div>
                      )
                    case "email":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{contact.column_name}</label>
                          <input
                            type="email"
                            className="form-control"
                            name={contact.column_slug}
                            onChange={handleChange}
                            value={contactField[contact.column_slug]}
                          />
                          <span className="text-danger">{errors[contact.column_slug]}</span>
                        </div>
                      )
                    case "number":
                      return (
                        <div className="form-group">
                          <label htmlFor="">{contact.column_name}</label>
                          <input
                            type="number"
                            className="form-control"
                            name={contact.column_slug}
                            onChange={handleChange}
                            value={contactField[contact.column_slug]}
                          />
                          <span className="text-danger">{errors[contact.column_slug]}</span>
                        </div>
                      )
                    case "choice":                    
                      return (contact.column_slug && contact.column_slug == 'country') ? 
                      (
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
                      ):
                      (
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

                      case "inherit":                    
                        return (
                          <div className="form-group">
                            <label htmlFor="">{contact.column_name}</label>
                            <select name={contact.column_slug} className="form-control"  onChange={handleChange} 
                            value={ (contactField[contact.column_slug] && contactField[contact.column_slug]['value']) ? contactField[contact.column_slug]['value'] : contactField[contact.column_slug] }>
                              <option data-country_id="" data-country_name="" data-ref="" value="">Select</option>
                              {
                                (contact.values && contact.values.length > 0 ?
                                  contact.values.map((data,index) => (
                                    <option data-country_id={(data.country_id) ? data.country_id : ''} data-country_name={(data.country_name) ? data.country_name : ''} data-ref={data.ref} key={`${index}_${contact._id}`} value={data.value}>{data.label}</option>
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
                )
                ) : null}

            {contact_fields && contact_fields.length > 0 ? 
            (
              <div className="org-btn-group">
                <button type="button" onClick={() => closeSideBarFunc()} className="btn btn-md btn-outline-dark">Cancel</button>
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

export default NewContactSide;
