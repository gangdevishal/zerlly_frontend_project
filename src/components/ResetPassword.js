import React, { Fragment, useEffect, useRef } from "react";
import { Layout, Row, Col, Form, Input, Button } from "antd";
import { NavLink } from "react-router-dom";
import { connect,useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import Alert from "./Alert";
import LoginBottom from "./LoginBottom";
import "./css/reset_password.css";
import { resetPassword } from "../redux/actions/authentication";
import { useTranslation, Trans } from 'react-i18next';
const { Content } = Layout;

function ResetPassword(props) {
  const { t, i18n } = useTranslation();
  const theme = useSelector((state) => state.theme);

  const formRef = useRef();
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.alert && props.alert.alertType == "success") {
        formRef.current.resetFields();
        props.history.push("/login");
    }
  }, [props.alert]);

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    var formData = {
      reset_password_token: props.match.params.token,
      new_password: values.new_password,
      confirm_new_password: values.confirm_new_password,
    };
    props.resetPassword(formData, props);    
  };

  return (
    <Fragment>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <Layout className="layout reset_password_page">
        <Content className="main" style={{backgroundImage: 'url("assets/images/login_bg.jpg")'}}>
          <Alert />
          <div className="reset_box center">
            <Row className="first_row">
              <Col span={24}>
                <NavLink to="/">{theme && theme.latest_theme && theme.latest_theme.mode == 'dark' ? (<img src={`assets/images/zellry_sign_white.svg`} alt="zellry" />) : (<img src={`assets/images/zellry_sign_black.svg`} alt="zellry" />) } </NavLink>
              </Col>
            </Row>
            <Row className="second_row">
              <Col span={24} className="column">
              {t("reset.label")}
              </Col>
            </Row>

            <Row className="third_row">
              <Col span={24} className="column">
                <Form
                  form={form}
                  layout="vertical"
                  className="reset_form"
                  name="reset"
                  onFinish={onFinish}
                  ref={formRef}
                >
                  <Form.Item
                    name="new_password"
                    label={t("reset.new_password")}
                    rules={[
                      {
                        required: true,
                        message: t("reset.new_password_required"),
                      },
                      {
                        whitespace: true,
                        message: t("reset.new_password_valid"),
                      },
                    ]}
                    hasFeedback
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    name="confirm_new_password"
                    label={t("reset.confirm_password")}
                    dependencies={["new_password"]}
                    rules={[
                      {
                        required: true,
                        message: t("reset.confirm_password_required"),
                      },
                      {
                        whitespace: true,
                        message: t("reset.confirm_password_valid"),
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("new_password") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              t("reset.confirm_password_match")
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
                      {t("reset.button")}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </div>
        </Content>
        <LoginBottom />
      </Layout>
    </Fragment>
  );
}

const mapStateToProps = (state) => ({ alert: state.alert });
const mapDispatchToProps = {
  resetPassword,
};
export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
