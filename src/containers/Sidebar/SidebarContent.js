import React, { Component } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";

import CustomScrollbars from "../../util/CustomScrollbars";
import SidebarLogo from "./SidebarLogo";

import Auxiliary from "../../util/Auxiliary";
import UserProfile from "./UserProfile";
import AppsNavigation from "./AppsNavigation";
import {
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  THEME_TYPE_LITE
} from "../../constants/ThemeSetting";
import IntlMessages from "../../util/IntlMessages";
import { connect } from "react-redux";

class SidebarContent extends Component {

  getNoHeaderClass = (navStyle) => {
    if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR || navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) {
      return "gx-no-header-notifications";
    }
    return "";
  };
  getNavStyleSubMenuClass = (navStyle) => {
    if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR) {
      return "gx-no-header-submenu-popup";
    }
    return "";
  };

  render() {
    const { themeType, navStyle, pathname } = this.props;
    const selectedKeys = pathname.substr(1);
    const defaultOpenKeys = selectedKeys.split('/')[1];
    return (
      <Auxiliary>
        <SidebarLogo />
        <div className="gx-sidebar-content">
          <div className={`gx-sidebar-notifications ${this.getNoHeaderClass(navStyle)}`}>
            <UserProfile />
            <AppsNavigation />
          </div>
          <CustomScrollbars className="gx-layout-sider-scrollbar">
            <Menu
              defaultOpenKeys={[defaultOpenKeys]}
              selectedKeys={[selectedKeys]}
              theme={themeType === THEME_TYPE_LITE ? 'lite' : 'dark'}
              mode="inline">
              <Menu.Item key="dashboard">
                <Link to="/dashboard">
                  <i className="icon icon-dasbhoard" />
                  <IntlMessages id="_vietnamese.sidebar.dashboard" />
                </Link>
              </Menu.Item>
              <Menu.Item key="rooms">
                <Link to="/rooms">
                  <i className="icon icon-calendar" />
                  <IntlMessages id="_vietnamese.sidebar.calendar" />
                </Link>
              </Menu.Item>
              {/* <Menu.Item key="conversation">
                <Link to="/conversation">
                  <i className="icon icon-chat-bubble -flex-column-reverse" />
                  <IntlMessages id="_vietnamese.sidebar.conversation" />
                </Link>
              </Menu.Item> */}
            </Menu>
          </CustomScrollbars>
        </div>
      </Auxiliary>
    );
  }
}

SidebarContent.propTypes = {};
const mapStateToProps = ({ settings }) => {
  const { navStyle, themeType, locale, pathname } = settings;
  return { navStyle, themeType, locale, pathname }
};
export default connect(mapStateToProps)(SidebarContent);

