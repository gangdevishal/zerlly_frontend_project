import React, { Fragment, useState } from "react";
import "./css/organization_add_modal.css";
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
import { addOrganisation, filterOrganisation, getOrganisations } from "../redux/actions/organisation";

const { Panel } = Collapse;

function OrganizationAddModal(props) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );
  const organisation_fields = useSelector((state) => (state.custom_table_field && state.custom_table_field.organisations) || []);

  const onFinish = async(form_values) => {
    console.log("Received values of form: ", form_values);

    let form_data = {user: current_user_id};
    for (const org1 of organisation_fields) {
      let getValue = form_values[org1.column_slug] ? form_values[org1.column_slug] : "";
      if(['choice','inherit'].includes(org1.column_type.toLocaleLowerCase())){
        let ref =  '';
        if(org1.column_slug == 'organization'){
          ref = 'organization';
        }
        else if(org1.column_slug == 'contact_name'){
          ref = 'contact';
        }
        else if(org1.column_slug == 'responsible'){
          ref = 'user';
        }
        else {
          ref = org1.column_slug;
        }
        form_data[org1.column_slug] = getValue ? {ref:ref, value:getValue} : "";
      }
      else{
        form_data[org1.column_slug] = form_values[org1.column_slug] ? form_values[org1.column_slug] : "";
      }       
    }

    console.log("final:",form_data);
    await dispatch(addOrganisation(form_data));
    props.reloadPageFunc();
    props.visibleFunc(false);
    form.resetFields();
  };

  return (
    <Fragment>
      <Modal
        title="New Organization"
        visible={props.visible}
        centered
        footer={[
          <Button
            type="text"
            className="organization_cancel_btn"
            onClick={() => {props.visibleFunc(false); form.resetFields();}}
          >
            Cancel
          </Button>,
          <Button
            type="primary"
            className="organization_submit_btn"
            onClick={() => form.submit()}
          >
            Create
          </Button>,
        ]}
        onCancel={() => {props.visibleFunc(false); form.resetFields();}}
        className="organization_add_modal"
        destroyOnClose={true}
      >
        <Row>
          <Col span={24}>
            <Form
              form={form}
              layout="vertical"
              className="organization_add_form"
              onFinish={onFinish}
            >
              {organisation_fields && organisation_fields.length > 0
              ? 
              organisation_fields.map((org) => (
                <Fragment key={org._id}>
                {(() => {
                  let column_type = org.column_type.toLowerCase();
                  switch (column_type) {
                    case "text":
                    case "phone":
                      return (
                        <Form.Item
                          label={org.column_name}
                          name={org.column_slug}
                          rules={[
                            {
                              required: org.is_required,
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
                          label={org.column_name}
                          name={org.column_slug}
                          rules={[
                            {
                              required: org.is_required,
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
                          label={org.column_name}
                          name={org.column_slug}
                          rules={[
                            {
                              required: org.is_required,
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
                      return (
                        <Form.Item
                        label={org.column_name}
                        name={org.column_slug}
                        rules={[
                          {
                            required: org.is_required,
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
                              (org.values && org.values.length > 0 ?
                                org.values.map((data,index) => (
                                  <Select.Option data-ref={data.ref} key={`${index}_${org._id}`} title={data.label}  value={data.value}>{data.label}</Select.Option>
                                ))
                               : null)
                            }
                        </Select>
                      </Form.Item>
                      );
                    case "date":
                      return (
                        <Form.Item
                          label={org.column_name}
                          name={org.column_slug}
                          rules={[
                            {
                              required: org.is_required,
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

export default OrganizationAddModal;
