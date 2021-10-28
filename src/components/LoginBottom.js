import React, { useState, useEffect, Fragment } from "react";
import { NavLink } from "react-router-dom";
import "./css/login_bottom.css";
import { Drawer,Menu, Dropdown, Button, Space } from "antd";
import { useTranslation, Trans } from 'react-i18next';
import {useSelector, useDispatch} from "react-redux";
import { applyTheme } from '../redux/actions/theme';
import { darkTheme, lightTheme } from './themes/Themes';
import { CareRightIcon, SunIcon, MoonIcon } from "./Icons";

function LoginBottom() {
  const [visiblelangs, setvisiblelangs] = useState(false);
  const [lngs, setLngs] = useState({ en: { nativeName: 'English' }});
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const latest_theme = useSelector((state) => state.theme.latest_theme.mode);

  useEffect(() => {
    i18n.services.backendConnector.backend.getLanguages((err, ret) => {
      console.log('ret:',ret);
      if (err) {
        console.log('errorL:',err);
        return;
      };
      setLngs(ret);
    });
  }, []);

  const openDrawer = () => {
    setvisiblelangs(true);
  };

  const closeDrawer = () => {
    setvisiblelangs(false);
  };

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
    setvisiblelangs(false);
  };

  const checkKeyByValue = (object, value) => {
    return Object.keys(object).find(key => key === value);
  }

  const toggleTheme = (new_theme) => {
    // let new_theme = (latest_theme == 'light') ? darkTheme : lightTheme;
    dispatch(applyTheme(new_theme));
  }
  const active_theme = (theme_mode) => {
    return (latest_theme == theme_mode) ? 'active_theme' : '' ;
  }

  return (
    <div className="bottom_page">
      
      <Dropdown overlay={languages_menu(lngs, changeLanguage)} placement="topLeft">
        <span className="language_section">
        {checkKeyByValue(lngs,i18n.language) ? 
          Object.keys(lngs).map((lng) => {
            if (i18n.language === lng) {
              return (
                <Fragment>
                  <span
                    style={{ display: "flex" }}
                  >
                    {lngs[lng].nativeName} <CareRightIcon height={15} />
                  </span>
                </Fragment>
              );
            }
          }
          )
        : 
        (<Fragment> <span
          style={{ display: "flex" }}
        >
          English <CareRightIcon height={15} />
        </span></Fragment>)
        }
        </span>
      </Dropdown> 
      
      <span className="logo">
        <NavLink to="/">
          <img src="assets/images/rukkor_blue_logo.svg" alt="zellry" />{" "}
        </NavLink>
      </span>
      <span className="mode">
        <span className="sun_mode" onClick={()=> toggleTheme(lightTheme)}>
          <span className={active_theme('light')}><SunIcon height={15} /></span>
        </span>
        <span className="moon_mode" onClick={()=> toggleTheme(darkTheme)}>
          <span className={active_theme('dark')}><MoonIcon height={15} fill={active_theme('dark') ? "#1A1D20" : '' } /></span>
        </span>
      </span>
      <Drawer
        bodyStyle={{padding: '0'}}
        maskClosable="false" 
        closable="false"
        height="100%"
        width="100%"
        title={false}
        placement={"bottom"}
        closable={false}
        onClose={closeDrawer}
        visible={visiblelangs}
        key={"bottom"}
      >
        <div className="index_wrapper index_collapsed index_full-width">
          <div className="index_navbar">
            <svg
              width={45}
              height={30}
              viewBox="0 0 45 30"
              fill="none"
              className="index_back"
              onClick={closeDrawer}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.50533 13.7242C1.15615 14.0733 0.981894 14.5312 0.982564 14.9889C0.976715 15.4531 1.15092 15.9193 1.50519 16.2735L14.3882 29.1566C15.0852 29.8536 16.2153 29.8536 16.9124 29.1566C17.6094 28.4596 17.6094 27.3295 16.9124 26.6325L7.32338 17.0435L42.3874 17.0435C43.4359 17.0435 44.2858 16.1935 44.2858 15.1451C44.2858 14.0966 43.4359 13.2467 42.3874 13.2467L7.03104 13.2467L16.9125 3.36525C17.6095 2.66823 17.6095 1.53814 16.9125 0.841122C16.2155 0.144104 15.0854 0.144106 14.3884 0.841124L1.50533 13.7242Z"
                fill="black"
                fillOpacity="0.8"
              />
            </svg>
          </div>

          
          {/* <div>
                  {Object.keys(lngs).map((lng) => (
                    <button
                      key={lng}
                      style={{
                        fontWeight: i18n.language === lng ? "bold" : "normal",
                      }}
                      type="submit"
                      onClick={() => i18n.changeLanguage(lng)}
                    >
                      {lngs[lng].nativeName}
                    </button>
                  ))}
                </div> */}
          <div className="index_page-title">Select Your Language</div>
          <div className="index_scroll">
            <div className="index_container">
              <div className="index_content">
                <div className="index_item">
                  <div className="index_area">‎中文(简体)‎</div>
                </div>
                <div className="index_item">
                  <div className="index_area">‎‎中文(繁體)‎</div>
                </div>
                <div className="index_item" onClick={() => changeLanguage('en')}>
                  <div className="index_area">‎English</div>
                </div>
                <div className="index_item" onClick={() => changeLanguage('de')}>
                  <div className="index_area">Deutsch</div>
                </div>
                <div className="index_item">
                  <div className="index_area">عربى</div>
                </div>
                <div className="index_item">
                  <div className="index_area">الروسية</div>
                </div>
                <div className="index_item">
                  <div className="index_area">עברית</div>
                </div>
                <div className="index_item">
                  <div className="index_area">한국어</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Português (Brasil)‎</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Bahasa Indonesia</div>
                </div>
                <div className="index_item">
                  <div className="index_area">हिन्दी</div>
                </div>
                <div className="index_item">
                  <div className="index_area">தமிழ்</div>
                </div>
                <div className="index_item">
                  <div className="index_area">తెలుగు</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ಕನ್ನಡ</div>
                </div>
                <div className="index_item">
                  <div className="index_area">मराठी</div>
                </div>
                <div className="index_item">
                  <div className="index_area">മലയാളം</div>
                </div>
                <div className="index_item">
                  <div className="index_area">বাংলা</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ภาษาไทย</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Tiếng Việt</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Bahasa Melayu</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Türkçe</div>
                </div>
                <div className="index_item">
                  <div className="index_area">العربية</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Русский</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Español (América)‎</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Українська</div>
                </div>
                <div className="index_item">
                  <div className="index_area">O'zbekcha</div>
                </div>
                <div className="index_item">
                  <div className="index_area">অসমীয়া</div>
                </div>
                <div className="index_item">
                  <div className="index_area">فارسی</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Français</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Italiano</div>
                </div>
                <div className="index_item">
                  <div className="index_area">עברית</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ဗမာ</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Polski</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Español (España)‎</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Čeština</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Ελληνικά</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Nederlands</div>
                </div>
                
                <div className="index_item">
                  <div className="index_area">日本語‎</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Bosanski‎</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Hrvatski</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Suomi</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Latviešu</div>
                </div>
                <div className="index_item">
                  <div className="index_area">नेपाली</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Português (Portugal)</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Română</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Српски</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Slovenčina</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Slovenščina</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Lietuvių</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ગુજરાતી</div>
                </div>
                <div className="index_item">
                  <div className="index_area">հայերեն</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ਪੰਜਾਬੀ</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Hausa</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Қазақ тілі</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Azərbaycan</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ଓଡ଼ିଆ</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Shqip</div>
                </div>
                <div className="index_item">
                  <div className="index_area">Български</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ქართული</div>
                </div>
                <div className="index_item">
                  <div className="index_area">ខ្មែរ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

const languages_menu = (lngs,changeLanguage) => (
  <Menu>
      {Object.keys(lngs).map((lng) => (
        <Menu.Item key={lng} onClick={() => changeLanguage(lng)}>
          {lngs[lng].nativeName}
        </Menu.Item>
      ))}
  </Menu>
);

export default LoginBottom;
