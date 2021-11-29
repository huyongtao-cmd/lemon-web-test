import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import styles from './index.less';
import kr from '@/assets/img/menu_kr_icon.svg';
import okr from '@/assets/img/menu_okr_icon.svg';
import processIcon from '@/assets/img/menu_process_icon.svg';
import report from '@/assets/img/menu_report_icon.svg';
import work from '@/assets/img/menu_work_icon.svg';

@connect(({ global }) => ({ global }))
class ShortcutMenu extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      // menuData = [],
      currentPage = '/user/home',
      global: { homeConfigData = [] },
    } = this.props;
    const platData = homeConfigData.find(item => item.wbLink === currentPage) || {};
    const menuData = platData.benchMenuViewList || [];
    return (
      <div className={styles.shortcutMenuWrap} style={{ padding: '1px 0', height: 'auto' }}>
        {menuData &&
          menuData.map((item, idx) => (
            <div
              className={styles.shortcutMenuItem}
              key={item.id}
              onClick={() => {
                //跳外围页面临时解决方案：链接内带http则打开新页面，否则使用路由跳转
                if (item.menuLink.indexOf('https') === -1) {
                  router.push(item.menuLink);
                } else {
                  window.open(item.menuLink, '_blank');
                }
              }}
            >
              <img
                src={item.imgFile ? `data:image/jpeg;base64,${item.imgFile}` : work}
                alt={item.menuName}
              />
              <span>{item.menuName}</span>
            </div>
          ))}
      </div>
    );
  }
}

export default ShortcutMenu;
