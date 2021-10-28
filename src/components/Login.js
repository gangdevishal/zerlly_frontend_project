import React, { Fragment, useEffect, useState } from "react";
import { Layout, Row, Col, Form, Input, Button } from "antd";
import "./css/login.css";
import { Link, NavLink } from "react-router-dom";
import { connect,useSelector } from "react-redux";
import { authLogin } from "../redux/actions/authentication";
import { Helmet } from "react-helmet-async";
import Alert from "./Alert";
import LoginBottom from "./LoginBottom";
// the hook
import { useTranslation, Trans } from 'react-i18next';

const { Content } = Layout;

function Login(props) {
  const { t, i18n } = useTranslation();
  const theme = useSelector((state) => state.theme);
  const alert = useSelector((state) => state.alert);

  const [displayMsg, setDisplayMsg] = useState(true);

  const [form] = Form.useForm();
  useEffect(() => {
   if(alert && alert.alertType && alert.alertType !=='success') {
    setDisplayMsg(true);
   }
   else {
    setDisplayMsg(false);
   }
  }, [alert])
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    var login_data = { email: values.email, password: values.password };
    props.authLogin(props, login_data);
  };

  return (
    <Fragment>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Layout className="layout login_page">
        <Content className="main" style={{backgroundImage: 'url("assets/images/login_bg.jpg")'}}>
          {
            displayMsg && <Alert />
          }          
          <div className="login_box center">
            <Row className="first_row">
              <Col span={24}>                
                <NavLink to="/">{theme && theme.latest_theme && theme.latest_theme.mode == 'dark' ? (<img src={`assets/images/zellry_sign_white.svg`} alt="zellry" />) : (<img src={`assets/images/zellry_sign_black.svg`} alt="zellry" />) } </NavLink>
              </Col>
            </Row>
            <Row className="second_row">
              <Col span={24} className="column">
                {t("login.label")}
              </Col>
            </Row>

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
                    label={t("login.email")}
                    name="email"
                    rules={[
                      {
                        type: "email",
                        message: t("login.email_valid","The input is not valid E-mail!"),
                      },
                      {
                        required: true,
                        message: t("login.email_required","Please input your E-mail!"),
                      },
                    ]}
                    hasFeedback
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={t("login.password")}
                    rules={[
                      {
                        required: true,
                        message: t("login.password_required","Please input your password!") ,
                      },
                      {
                        whitespace: true,
                        message: t("login.password_valid","Please input valid password!"),
                      },
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
                      {t("login.button")}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
            <Row className="fourth_row">
              <Col span={24} className="column">
                <Link className="forgotlink" to="/forgot-password">
                {t("login.forgot")}
                </Link>
              </Col>
            </Row>
          </div>
        </Content>
        <LoginBottom />
      </Layout>
    </Fragment>
  );
}

export default connect(null, { authLogin })(Login);
