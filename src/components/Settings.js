import React, { Fragment, useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import {
  Row,
  Col,
  Card,
  Typography,
  Select,
  Switch,
  Avatar,
  Image,
  Form,
  Input,
  Button,
} from "antd";
import "./css/settings.css";

import { useTranslation, Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { settingLog, getSetting } from "../redux/actions/setting";
import { changePassword } from "../redux/actions/authentication";

const { Title, Text } = Typography;

function Settings(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const current_user_id = useSelector((state) => (state.auth && state.auth.user._id) || "");
  const noti_settings = useSelector((state) => (state.setting && state.setting.data) || "");
  const alert = useSelector((state) => state.alert || 's' );


  let initialNotificationSettings = {
    user: current_user_id,
    new_notes_email: noti_settings.new_notes_email,
    new_notes_notification: noti_settings.new_notes_notification,
    change_deal_status_notification:noti_settings.change_deal_status_notification,
    edit_detail_notification:noti_settings.edit_detail_notification,
  }
  const [notiSettings, setNotificationSettings] = useState(initialNotificationSettings)

  useEffect(() => {
    dispatch(getSetting(current_user_id));
  }, []);

  useEffect(() => {
    if(alert && alert.alertType && alert.alertType =='success') {
      form.resetFields();
    }   
  }, [alert])

  const onFinish = async(values) => {
    console.log("Received values of form: ", values);
    const formData = {
      current_user:current_user_id,
      old_password:values.cpwd,
      new_password:values.npwd,
      cnew_password:values.cnpwd,
    };
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    await dispatch(changePassword(formData, config));
  };

  const updateNotificationSetting = async(name,value) => {
    notiSettings[name] = value;
    console.log("notiSettings::",notiSettings);
    const formData = notiSettings;
      const config = {
        headers: {
          "content-type": "application/json",
        },
      };
      await dispatch(settingLog(formData, config));
      await dispatch(getSetting(current_user_id));
  }

  return (
    <Fragment>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <Layout location={location}>
        <Row>
          <Col sm={{ span: 18, offset: 3 }} md={{ span: 18, offset: 3 }}  xs={{ span: 22, offset: 1 }} lg={{ span: 12, offset: 6 }} xl={{ span: 8, offset: 8 }} className="settings-container">
            <Row>
              <Col span={24} className="notify-section">
                <Row>
                  <Col>
                    <Title level={5}>Notifications</Title>
                  </Col>
                </Row>
                <Row>
                  <Col xl={2} sm={2} md={2} xs={4} lg={2}>
                    <Switch size="small" onChange={(v)=>updateNotificationSetting('new_notes_email',v)} checked={noti_settings.new_notes_email} />
                  </Col>
                  <Col xl={22} sm={22} md={22} xs={20} lg={22}>
                    Email me when someone adds notes to my deals
                  </Col>
                </Row>
                <Row>
                  <Col xl={2} sm={2} md={2} xs={4} lg={2}>
                    <Switch size="small" onChange={(v)=>updateNotificationSetting('new_notes_notification',v)} checked={noti_settings.new_notes_notification} />
                  </Col>
                  <Col xl={22} sm={22} md={22} xs={20} lg={22}>
                    Notify me when someone adds notes to my deals
                  </Col>
                </Row>
                <Row>
                  <Col xl={2} sm={2} md={2} xs={4} lg={2}>
                    <Switch size="small" onChange={(v)=>updateNotificationSetting('change_deal_status_notification',v)} checked={noti_settings.change_deal_status_notification} />
                  </Col>
                  <Col xl={22} sm={22} md={22} xs={20} lg={22}>
                    Notify me when someone changes status of my deals
                  </Col>
                </Row>
                <Row>
                  <Col xl={2} sm={2} md={2} xs={4} lg={2}>
                    <Switch size="small" onChange={(v)=>updateNotificationSetting('edit_detail_notification',v)} checked={noti_settings.edit_detail_notification} />
                  </Col>
                  <Col xl={22} sm={22} md={22} xs={20} lg={22}>Notify me when someone edits my deals</Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="change-pwd-section">
              <Row>
                  <Col span={24}>
                    <Title level={5}>Password</Title>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form
                      form={form}
                      layout="vertical"
                      className="change_pswd_form"
                      name="login"
                      onFinish={onFinish}
                    >
                      <Form.Item
                        label="Current Password"
                        name="cpwd"
                        rules={[
                          {
                            required: true,
                            message: "Please input your current password!",
                          },
                        ]}
                        hasFeedback
                      >
                        <Input.Password />
                      </Form.Item>
                      <Form.Item
                        name="npwd"
                        label="New Password"
                        rules={[
                          {
                            required: true,
                            message: "Please input your new password!",
                          },
                          {
                            pattern: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/,
                            message: 'Password must be min 8 letter password, with at least a symbol, a letter and a number.',
                          },
                          {
                            whitespace: true,
                            message: "Please input valid password!",
                          },
                        ]}
                        hasFeedback
                      >
                        <Input.Password />
                      </Form.Item>
                      <Form.Item
                        name="cnpwd"
                        label="Confirm New Password"
                        dependencies={["npwd"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input your confirm new password!",
                          },
                          {
                            whitespace: true,
                            message: "Please input valid password!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("npwd") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error(
                                  "New password and Confirm new password must match."
                                )
                              );
                            },
                          }),
                        ]}
                        hasFeedback
                      >
                        <Input.Password />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="submit_btn"
                        >
                          Change Password
                        </Button>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout>
    </Fragment>
  );
}

export default Settings;
