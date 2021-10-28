import React, { Fragment, useState, useEffect } from "react";
import "./css/contact_add_modal.css";
import { useTranslation, Trans } from "react-i18next";

import {
  Modal,
  Button,
  Tabs,
  Row,
  Col,
  Comment,
  Tooltip,
  Timeline,
  Avatar,
  Input,
  Collapse,
  Form,
  Select,
  DatePicker
} from "antd";
import moment from "moment-timezone";
import { connect, useSelector, useDispatch } from "react-redux";
import { addContact, filterContact, getContacts } from "../redux/actions/contact";
import { setNewContact} from "../redux/actions/organisation";

const { Panel } = Collapse;

function ContactAddModal(props) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const contact_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.contacts) || []);
  const organization_new_contact= useSelector((state) => (state.organisation && state.organisation.new_contact) || "");
  const organization_edit = useSelector((state) => (state.organisation && state.organisation.edit) || "");

  const onFinish = async(form_values) => {
    console.log("Received values of form: ", form_values);

    let form_data = {user: current_user_id};
    for (const contact1 of contact_fields) {
      let getValue = form_values[contact1.column_slug] ? form_values[contact1.column_slug] : "";
      if(['choice','inherit'].includes(contact1.column_type.toLocaleLowerCase())){
        let ref =  '';
        if(contact1.column_slug == 'organization'){
          ref = 'organization';
        }
        else if(contact1.column_slug == 'contact_name'){
          ref = 'contact';
        }
        else if(contact1.column_slug == 'responsible'){
          ref = 'user';
        }
        else {
          ref = contact1.column_slug;
        }
        form_data[contact1.column_slug] = getValue  ? {ref:contact1.column_slug, value:getValue} : "";
      }
      else{
        form_data[contact1.column_slug] = form_values[contact1.column_slug] ? form_values[contact1.column_slug] : "";
      }       
    }

    console.log("final:",form_data);
    await dispatch(addContact(form_data));
    props.reloadPageFunc();
    closeAddModal();
  };

  const closeAddModal = () => {
    props.visibleFunc(false); 
    form.resetFields(); 
    if(organization_new_contact){
      dispatch(setNewContact(null));
    }
  }

  return (
    <Fragment>
      <Modal
        title="New Contact"
        visible={props.visible}
        centered
        footer={[
          <Button type="text" className="contact_cancel_btn" onClick={closeAddModal}>
            Cancel
          </Button>,
          <Button type="primary" className="contact_submit_btn" onClick={() => form.submit() }>
            Create
          </Button>,
        ]}
        onCancel={closeAddModal}
        className="contact_add_modal"
        destroyOnClose={true}
      >
        <Row>
          <Col span={24}>
            <Form
              form={form}
              layout="vertical"
              className="contact_add_form"
              onFinish={onFinish}
            >
              {contact_fields && contact_fields.length > 0
              ? 
              contact_fields.map((contact) => (
                <Fragment key={contact._id}>
                {(() => {
                  let column_type = contact.column_type.toLowerCase();
                  let column_slug = contact.column_slug;
                  let setValue = '';
                  if(organization_new_contact) {
                    if(['choice','inherit'].includes(column_type)){
                      if(column_slug == 'country' && organization_edit.country && organization_edit.country.value){
                        setValue = organization_edit.country.value;
                      }
                      else if(column_slug == 'organization' && organization_edit._id){
                        setValue = organization_edit._id;
                      }
                    }
                    form.setFieldsValue({
                      [column_slug]: setValue,
                    });
                  }                  
                  switch (column_type) {
                    case "text":
                    case "phone":
                      return (
                        <Form.Item
                          label={contact.column_name}
                          name={contact.column_slug}
                          rules={[
                            {
                              required: contact.is_required,
                              message: "Field Required!",
                            },
                          ]}
                          hasFeedback
                        >
                          <Input />
                        </Form.Item>
                      );
                    case "email":
                      return (
                        <Form.Item
                          label={contact.column_name}
                          name={contact.column_slug}
                          rules={[
                            {
                              required: contact.is_required,
                              message: "Field Required!",
                            },
                            {
                              type: "email",
                              message: "The input is not valid E-mail!",
                            },
                          ]}
                          hasFeedback
                        >
                          <Input />
                        </Form.Item>
                      );
                    case "number":
                      return (
                        <Form.Item
                          label={contact.column_name}
                          name={contact.column_slug}
                          rules={[
                            {
                              required: contact.is_required,
                              message: "Field Required!",
                            },
                            // {
                            //   type: "number",
                            //   message: "The input is not valid phone",
                            // },
                          ]}
                          hasFeedback
                        >
                          <Input />
                        </Form.Item>
                      );
                    case "choice":
                    case "inherit":
                      return (
                        <Form.Item
                        label={contact.column_name}
                        name={contact.column_slug}
                        rules={[
                          {
                            required: contact.is_required,
                            message: "Field Required!",
                          },
                        ]}
                        hasFeedback
                      >
                        <Select showSearch
                          filterOption={(input, option) => {
                            return (
                              option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                              option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            );                            
                          }}
                        >
                          {
                              (contact.values && contact.values.length > 0 ?
                                contact.values.map((data,index) => (
                                  <Select.Option data-ref={data.ref} key={`${index}_${contact._id}`} title={data.label}  value={data.value}>{data.label}</Select.Option>
                                ))
                               : null)
                            }
                        </Select>
                      </Form.Item>
                      );
                    case "date":
                      return (
                        <Form.Item
                          label={contact.column_name}
                          name={contact.column_slug}
                          rules={[
                            {
                              required: contact.is_required,
                              message: "Field Required!",
                            },
                          ]}
                          hasFeedback
                        >
                          <DatePicker className="dt-picker" format={'YYYY-MM-DD'} />
                        </Form.Item>
                      );
                    default:
                      return "";
                    }
                  })()}
                  </Fragment>
                )
                ) : null}
              
            </Form>
          </Col>
        </Row>
      </Modal>
    </Fragment>
  );
}

export default ContactAddModal;
