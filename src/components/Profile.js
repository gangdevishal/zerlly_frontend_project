import React, { Fragment, useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { Helmet } from "react-helmet-async";
import {
  Row,
  Col,
  Card,
  Typography,
  Select,
  DatePicker,
  Avatar,
  Image,
  Input,
  Tooltip,
  Button,
} from "antd";
import "./css/profile.css";
import { useTranslation, Trans } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import FusionCharts from "fusioncharts";
import charts from "fusioncharts/fusioncharts.charts";
import ReactFusioncharts from "react-fusioncharts";
import { updateProfile, getProfile } from "../redux/actions/authentication";
import { PenIcon, CameraIcon, SaveIcon, CancelIcon } from "./Icons";
import moment from "moment-timezone";

const { Title, Text } = Typography;
const { Option } = Select;

function Profile(props) {
  const { location } = props;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Resolves charts dependancy
  charts(FusionCharts);
  FusionTheme(FusionCharts);

  const theme = useSelector((state) => state.theme);
  const auth_user = useSelector(
    (state) => (state.auth && state.auth.user) || {}
  );
  const won_deal_ratio = useSelector(
    (state) => (state.auth && state.auth.won_deal_ratio) || 0
  );
  const lost_deal_ratio = useSelector(
    (state) => (state.auth && state.auth.lost_deal_ratio) || 0
  );
  var current_user_id = useSelector(
    (state) => (state.auth && state.auth.user._id) || ""
  );

  let initialState = {
    photo: "",
    username: auth_user && auth_user.username ? auth_user.username : "",
    email: auth_user && auth_user.email ? auth_user.email : "",
    contact_no: auth_user && auth_user.contact_no ? auth_user.contact_no : "",
    calender_event_title:
      auth_user && auth_user.calender_event_title
        ? auth_user.calender_event_title
        : "",
    date_joined:
      auth_user && auth_user.date_joined ? auth_user.date_joined : "",
    photo_preview: null,
    photo_error: "",
    refresh: true,
  };
  const [profile, setProfile] = useState(initialState);
  const [editProfile, setEditProfile] = useState(false);
  const [profileKey, setProfileKey] = useState(Date.now);

  const fileRef = useRef(null);

  useEffect(() => {
    let user_id = auth_user && auth_user._id ? auth_user._id : "";
    dispatch(getProfile(user_id));
  }, [profileKey]);

  const handleInputChange = (e) => {
    const { type, name, value, files } = e.target;
    if (type === "file") {
      const imageFile = files[0];
      if (!imageFile.name.match(/\.(jpg|jpeg|png|gif)$/)) {
        setProfile({ ...profile, photo_error: "Please select valid image." });
        return false;
      }
      console.log("files::", files);
      setProfile({
        ...profile,
        photo_error: "",
        photo_preview: URL.createObjectURL(files[0]),
        [name]: files[0],
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const saveProfile = async () => {
    const { photo, username, email, contact_no, calender_event_title } =
      profile;
    const formData = new FormData();
    formData.append("_id", current_user_id);
    formData.append("photo", photo);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("contact_no", contact_no);
    formData.append("calender_event_title", calender_event_title);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    setEditProfile(false);
    console.log("formData::", formData);
    await dispatch(updateProfile(formData, config));
    await setProfileKey(Date.now);
    setProfile({ ...profile, photo_preview: null, photo: null });
  };

  const cancelProfile = () => {
    setEditProfile(false);
    setProfile(initialState);
  };

  return (
    <Fragment>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <Layout location={location}>
        <Row>
          <Col
            sm={{ span: 18, offset: 3 }}
            md={{ span: 18, offset: 3 }}
            xs={{ span: 22, offset: 1 }}
            lg={{ span: 12, offset: 6 }}
            xl={{ span: 8, offset: 8 }}
            className="myProfile"
          >
            <Row className="profile_section">
              <Col
                sm={24}
                md={24}
                xs={24}
                lg={11}
                xl={11}
                className="avtar-section"
              >
                <Avatar
                  size={150}
                  shape="circle"
                  src={
                    profile.photo_preview
                      ? profile.photo_preview
                      : auth_user && auth_user.photo
                      ? auth_user.photo
                      : null
                  }
                />
                <span
                  className="edit-avtar"
                  onClick={() => fileRef.current.click()}
                >
                  <CameraIcon height={20} width={20} />
                </span>
                <input
                  type="file"
                  ref={fileRef}
                  name="photo"
                  onChange={handleInputChange}
                  style={{ display: "none" }}
                />
                <div className="pic-bottom">
                  {profile.photo_error ? (
                    <Text type="danger">{profile.photo_error}</Text>
                  ) : null}
                </div>
              </Col>
              <Col
                sm={24}
                md={24}
                xs={24}
                lg={11}
                xl={11}
                className="about-section"
              >
                <Row>
                  <Col span={24}>
                    {editProfile ? (
                      <Input
                        className="edit-input"
                        size="small"
                        name="username"
                        placeholder="Username"
                        value={profile.username}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Title level={5}>{profile.username}</Title>
                    )}
                  </Col>
                  <Col span={24}>
                    {editProfile ? (
                      <Input
                        className="edit-input"
                        size="small"
                        name="contact_no"
                        placeholder="Contact No"
                        value={profile.contact_no}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Text>{profile.contact_no}</Text>
                    )}
                  </Col>
                  <Col span={24}>
                    {editProfile ? (
                      <Input
                        className="edit-input"
                        size="small"
                        name="email"
                        placeholder="Email"
                        value={profile.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Text>{profile.email}</Text>
                    )}
                  </Col>
                  <Col span={24} className="joined_dt">
                    <Text>Joined</Text>
                  </Col>
                  <Col span={24}>
                    <Text>{moment(profile.date).format("YYYY-MM-DD")}</Text>
                  </Col>
                </Row>
              </Col>
              <Col
                sm={24}
                md={24}
                xs={24}
                lg={2}
                xl={2}
                className="edit-about-btn"
              >
                {profile.photo_preview || editProfile ? (
                  <Fragment>
                    <span className="edit-icon" onClick={saveProfile}>
                      <Tooltip title="Save Profile" placement="right">
                        <SaveIcon width={20} height={20} />
                      </Tooltip>
                    </span>
                    &nbsp;&nbsp;
                    <span className="edit-icon" onClick={cancelProfile}>
                      <Tooltip placement="right" title="Cancel">
                        <CancelIcon width={22} height={22} />
                      </Tooltip>
                    </span>
                  </Fragment>
                ) : (
                  <span
                    className="edit-icon"
                    onClick={() => setEditProfile(true)}
                  >
                    <Tooltip title="Edit Profile">
                      <PenIcon />
                    </Tooltip>
                  </span>
                )}
              </Col>
            </Row>

            <Row className="won_section">
              <Col span={24}>
                {won_deal_ratio <= 0 && lost_deal_ratio <= 0 ? (
                  <>
                    Won Deal Ratio:{won_deal_ratio} | Lost Deal Ratio:
                    {lost_deal_ratio}
                  </>
                ) : (
                  <ReactFusioncharts
                    type="pie2d"
                    width="100%"
                    // height="100%"
                    dataFormat="JSON"
                    dataSource={{
                      chart: {
                        valueFontColor: `${
                          theme && theme.latest_theme && theme.latest_theme.text
                            ? theme.latest_theme.text
                            : ""
                        }`,
                        bgColor: `${
                          theme &&
                          theme.latest_theme &&
                          theme.latest_theme.lightDarkBG
                            ? theme.latest_theme.lightDarkBG
                            : ""
                        }`,
                        theme: "fusion",
                      },
                      data: [
                        {
                          label: "Won",
                          value: won_deal_ratio,
                          color: "#62FFC5",
                        },
                        {
                          label: "Loss",
                          value: lost_deal_ratio,
                          color: "#FFA4A9",
                        },
                      ],
                    }}
                  />
                )}
              </Col>
            </Row>

            <Row className="followup_section">
              <Col span={24}>
                <Title level={5}>Follow Up Layout</Title>
                <Select
                  className="custom-select"
                  value={
                    profile.calender_event_title
                      ? profile.calender_event_title
                      : "contact_name"
                  }
                  name="calender_event_title"
                  style={{ width: "100%" }}
                  placeholder="Select Layout"
                  onChange={(value) => {
                    profile["calender_event_title"] = value;
                    saveProfile();
                  }}
                >
                  <Option value="organization">Organisation Name</Option>
                  <Option value="contact_name">Contact Name</Option>
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout>
    </Fragment>
  );
}

export default Profile;
