import React, { Fragment, useState, useEffect } from "react";
import { Layout, Row, Col, Form, Input, Button } from "antd";
import "./css/forgot_password.css";
import { Link, NavLink } from "react-router-dom";
import { connect,useSelector } from "react-redux";
import { sendResetLink } from "../redux/actions/authentication";
import { Helmet } from "react-helmet-async";
import Alert from "./Alert";
import LoginBottom from "./LoginBottom";
import { useTranslation, Trans } from 'react-i18next';
const { Content } = Layout;

function ForgotPassword(props) {
  const { t, i18n } = useTranslation();
  const [sentSuccess, setSentSuccess] = useState(false);
  const theme = useSelector((state) => state.theme);

  useEffect(() => {
    console.log("ddd", props.alert);
    if (props.alert && props.alert.alertType == "success") {
      setSentSuccess(true);
    }
  }, [props.alert]);

  const [form] = Form.useForm();
  const onFinish = async (values) => {
    console.log("Received values of form: ", values);
    let formData = { email: values.email };
    await props.sendResetLink(formData, props);
  };

  return (
    <Fragment>
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>
      <Layout className="layout forgot_page">
        <Content className="main" style={{backgroundImage: 'url("assets/images/login_bg.jpg")'}}>
          <Alert />
          <div className="forgot_box center">
            <Row className="first_row">
              <Col span={24}>
                <NavLink to="/">{theme && theme.latest_theme && theme.latest_theme.mode == 'dark' ? (<img src={`assets/images/zellry_sign_white.svg`} alt="zellry" />) : (<img src={`assets/images/zellry_sign_black.svg`} alt="zellry" />) } </NavLink>
              </Col>
            </Row>
            <Row className="second_row">
              <Col span={24} className="column">
              {t("forgot.label")}
              </Col>
            </Row>

            {sentSuccess ? (
              <Fragment>
                <Row className="third_row">
                  <Col span={24} className="column description">
                    <p>
                      {t("forgot.email_sent_description")}
                    </p>

                    <Button type="primary" className="submit_btn">
                      <Link className="forgotlink" to="/login">
                        {t("forgot.login_link")}
                      </Link>
                    </Button>
                  </Col>
                </Row>
              </Fragment>
            ) : (
              <Fragment>
                <Row className="third_row">
                  <Col span={24} className="column">
                    <Form
                      form={form}
                      layout="vertical"
                      className="login_form"
                      name="login"
                      onFinish={onFinish}
                    >
                      <Form.Item
                        label={t("forgot.email")}
                        name="email"
                        rules={[
                          {
                            type: "email",
                            message: t("forgot.email_valid"),
                          },
                          {
                            required: true,
                            message: t("forgot.email_required"),
                          },
                        ]}
                        hasFeedback
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="submit_btn"
                        >
                          {t("forgot.button")}
                        </Button>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
                <Row className="fourth_row">
                  <Col span={24} className="column">
                    <Link className="forgotlink" to="/login">
                    {t("forgot.login_link")}
                    </Link>
                  </Col>
                </Row>
              </Fragment>
            )}
          </div>
        </Content>
        <LoginBottom />
      </Layout>
    </Fragment>
  );
}

const mapStateToProps = (state) => ({ alert: state.alert });
const mapDispatchToProps = {
  sendResetLink,
};
export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
