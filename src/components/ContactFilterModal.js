import React, { Fragment, useState } from "react";
import "./css/contact_filter_modal.css";
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
import { addContact, filterContact, getContacts, setFilterFields } from "../redux/actions/contact";

const { Panel } = Collapse;

function ContactFilterModal(props) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const contact_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.contacts) || []);

  const onFinish = async(form_values) => {
    console.log("Received values of form: ", form_values);

    let form_data = { 
      // user: current_user_id 
    };
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
        form_data[contact1.column_slug] = form_values[contact1.column_slug] ? form_values[contact1.column_slug] : '';
      }       
    }

    console.log("final:",form_data);
    let param = {
      formField:form_data,
      other:{sort_by:"updated_at", order_by:'desc'},
    };
    dispatch(filterContact(param));
    dispatch(setFilterFields(form_data));
    props.setActiveFilterFunc(true);
    props.visibleFunc(false);    
  };

  const clearAll = () => {
    props.visibleFunc(false); 
    form.resetFields(); 
    props.reloadPageFunc();
    props.setActiveFilterFunc(false);
  }

  return (
    <Fragment>
      <Modal
        title="Filter Contact"
        visible={props.visible}
        centered
        footer={[
          <Button
            type="text"
            className="contact_cancel_btn"
            onClick={clearAll}
          >
            Clear All
          </Button>,
          <Button
            type="primary"
            className="contact_submit_btn"
            onClick={() => form.submit()}
          >
            Filter
          </Button>,
        ]}
        onCancel={() => {
          props.visibleFunc(false);
          // form.resetFields();
        }}
        className="contact_filter_modal"
        destroyOnClose={true}
      >
        <Row>
          <Col span={24}>
            <Form
              form={form}
              layout="vertical"
              className="contact_filter_form"
              onFinish={onFinish}
            >
              {contact_fields && contact_fields.length > 0
                ? contact_fields.map((contact) => (
                    <Fragment key={contact._id}>
                      {(() => {
                        if(!contact.is_filterable) return;
                        let column_type = contact.column_type.toLowerCase();
                        switch (column_type) {
                          case "text":
                          case "phone":
                            return (
                              <Form.Item
                                label={contact.column_name}
                                name={contact.column_slug}
                                rules={[
                                  // {
                                  //   required: contact.is_required,
                                  //   message: "Field Required!",
                                  // },
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
                                  // {
                                  //   required: contact.is_required,
                                  //   message: "Field Required!",
                                  // },
                                  // {
                                  //   type: "email",
                                  //   message: "The input is not valid E-mail!",
                                  // },
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
                                  // {
                                  //   required: contact.is_required,
                                  //   message: "Field Required!",
                                  // },
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
                                  // {
                                  //   required: contact.is_required,
                                  //   message: "Field Required!",
                                  // },
                                ]}
                                hasFeedback
                              >
                                <Select
                                  showSearch
                                  filterOption={(input, option) => {
                                    return (
                                      option.key
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0 ||
                                      option.title
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                    );
                                  }}
                                >
                                  {contact.values && contact.values.length > 0
                                    ? contact.values.map((data, index) => (
                                        <Select.Option
                                          data-ref={data.ref}
                                          key={`${index}_${contact._id}`}
                                          title={data.label}
                                          value={data.value}
                                        >
                                          {data.label}
                                        </Select.Option>
                                      ))
                                    : null}
                                </Select>
                              </Form.Item>
                            );
                          case "date":
                            return (
                              <Form.Item
                                label={contact.column_name}
                                name={contact.column_slug}
                                rules={[
                                  // {
                                  //   required: contact.is_required,
                                  //   message: "Field Required!",
                                  // },
                                ]}
                                hasFeedback
                              >
                                <DatePicker
                                  className="dt-picker"
                                  format={"YYYY-MM-DD"}
                                />
                              </Form.Item>
                            );
                          default:
                            return "";
                        }
                      })()}
                    </Fragment>
                  ))
                : null}
            </Form>
          </Col>
        </Row>
      </Modal>
    </Fragment>
  );
}

export default ContactFilterModal;
