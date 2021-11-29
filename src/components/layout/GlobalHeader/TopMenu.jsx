import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Icon, Popover } from 'antd';
import router from 'umi/router';
import { FormattedMessage } from 'umi/locale';
import styles from './index.less';
import { getIcon } from '../../_utils/iconTools';
import { dangerousGetState } from '@/utils/networkUtils';

// 顶端菜单图标
export default class GlobalHeaderTopMenu extends PureComponent {
  render() {
    const { menuData, onMetaSwitch, onActiveMeta, ReportChartLink } = this.props;
    const name = onActiveMeta || menuData[0].name;
    const { roles = [] } = dangerousGetState().user.user;
    const showChart = roles.includes('REPORT_PLAT');
    return (
      <div className={styles.topMenus}>
        {menuData &&
          menuData.map(menu => (
            <a
              key={menu.code}
              className={classnames(styles.link, name === menu.code && styles.activeLink)}
              onClick={e => {
                onMetaSwitch(e, menu.code);
                const goToUrl = menu.portalRoute;
                if (goToUrl && goToUrl.trim().length > 0) {
                  router.push(goToUrl);
                }
              }}
            >
              {/* <Popover
                overlayStyle={{ zIndex: 9999 }}
                placement="bottomLeft"
                title={<FormattedMessage id={menu.locale} defaultMessage={menu.desc} />}
                content={
                  <>
                    <Icon
                      className="anticon-exclamation-circle"
                      style={{ color: '#faad14', marginRight: 4 }}
                      type="info-circle-o"
                    />
                    <FormattedMessage id={menu.hint} defaultMessage="-" />
                  </>
                }
                trigger="hover"
              > */}
              {getIcon(menu.icon, styles.icon)}
              {/* <FormattedMessage id={menu.locale} defaultMessage={menu.desc} /> */}
              <span>{menu.name}</span>
              {/* </Popover> */}
            </a>
          ))}
        {/* 帆软链接 */}
        {showChart &&
          !!ReportChartLink && (
            <a
              key="tw"
              className={styles.link}
              href="/BI/auth?type=REPORT_PLAT"
              target="_blank"
              rel="noopener noreferrer"
            >
              {getIcon('bar-chart', styles.icon)}
              <FormattedMessage id="ui.menu.chart" defaultMessage="BI智能平台" />
            </a>
          )}
      </div>
    );
  }
}
