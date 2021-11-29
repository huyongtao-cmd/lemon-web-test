import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Row, Col, Tooltip, Icon, Input, Tag, Modal, message } from 'antd';
import styles from './customShortcutMenu.less';
import { createConfirm } from '@/components/core/Confirm';
import kr from '@/assets/img/menu_kr_icon.svg';
import okr from '@/assets/img/menu_okr_icon.svg';
import processIcon from '@/assets/img/menu_process_icon.svg';
import report from '@/assets/img/menu_report_icon.svg';
import work from '@/assets/img/menu_work_icon.svg';
import { sortPropAscByNumber } from '@/utils/dataUtils';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { NavsTree } from '@/pages/gen/field';
import {
  customShortCutDel,
  customShortCutUpdateSortNo,
  CustomShortCutAdd,
} from '@/services/gen/center';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { fromQs } from '@/utils/stringUtils';
import { treeToPlain } from '@/components/common/TreeTransfer';
// import { e } from 'mathjs';

const DOMAIN = 'workTableHome';
@connect(({ global, workTableHome }) => ({ global, workTableHome }))
class customShortcutMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      saveLoading: false,
    };
  }

  componentDidMount() {
    this.getNavs();
  }

  getNavs = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getNavs`,
    });
  };

  getCustomShortCut = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryCustomShortCut`,
      payload: {
        sortBy: 'sortNo',
        sortDirection: 'ASC',
        limit: 0,
      },
    });
  };

  // 删除
  handleClose = (removedTag, e) => {
    const { dispatch } = this.props;
    createConfirm({
      content: '继续操作将删除选中的数据，请确认是否继续？',
      onOk: () =>
        customShortCutDel(removedTag.id).then(() => {
          this.getNavs();
          this.getCustomShortCut();
        }),
    });

    e.stopPropagation();
  };

  handleNavsSave = () => {
    const { saveLoading } = this.state;
    const {
      workTableHome: { navTree },
    } = this.props;
    this.setState({ saveLoading: true });
    const defaultStructure = {
      id: 'code',
      pid: 'pcode',
      children: 'children',
      selected: 'checkFlag',
    };
    const { dispatch, workTableHome } = this.props;
    const { id } = fromQs();
    const { navCheckedKeys, navOldCheckedKeys } = workTableHome;
    const navTreeList = treeToPlain(navTree, defaultStructure).plain;

    /**
     * 第一步：找出原勾选的数组与新勾选的数组 的 交集与差集
     * 第二步：交集与新数组 对比出差集        就是需要增加的内容
     * 第三步：交集与旧数组 对比出差集        就是需要删除的内容
     */
    const intersection = navOldCheckedKeys.filter(v => navCheckedKeys.includes(v));
    const difference = navOldCheckedKeys
      .concat(navCheckedKeys)
      .filter(v => !navOldCheckedKeys.includes(v) || !navCheckedKeys.includes(v));

    const pushList = navCheckedKeys
      .concat(intersection)
      .filter(v => !navCheckedKeys.includes(v) || !intersection.includes(v));
    const delList = navOldCheckedKeys
      .concat(intersection)
      .filter(v => !navOldCheckedKeys.includes(v) || !intersection.includes(v));

    // 新增时 查找出是子节点的数据，不新增父节点。
    const usefulNode = [];
    navTreeList.forEach((treeItem, treeIndex, Tree) => {
      pushList.forEach((item, index, arr) => {
        if (treeItem.code === item) {
          if (!treeItem.hasChildren) {
            usefulNode.push(treeItem.code);
          }
        }
      });
    });

    dispatch({
      type: `${DOMAIN}/saveNavs`,
      payload: {
        saveNavCodes: usefulNode,
        delNavCodes: delList,
      },
    })
      .then(() => {
        this.setState({
          saveLoading: false,
          isVisible: false,
        });
        this.getNavs();
        this.getCustomShortCut();
      })
      .catch(() => {
        this.setState({
          saveLoading: false,
        });
      });
  };

  showMenu = () => {
    const { dispatch } = this.props;
    this.setState({
      isVisible: true,
    });
  };

  handleNavs = checkedKeys => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        navCheckedKeys: checkedKeys,
      },
    });
  };

  drag = e => {
    if (e.target.tagName === 'IMG') {
      e.target = e.target.parentNode;
    }
    e.dataTransfer.setData('Text', e.target.id);
  };

  drop = e => {
    e.preventDefault();
    const data = e.dataTransfer.getData('Text');
    if (e.target.tagName === 'IMG') {
      e.target = e.target.parentNode;
    } else if (e.target.tagName === 'UL') {
      // document.getElementById('wrapper').appendChild(document.getElementById(data));
    } else {
      // document.getElementById('wrapper').insertBefore(document.getElementById(data), e.target);
    }

    if (data.indexOf('fromMenu') !== -1) {
      CustomShortCutAdd({
        navCode: data.slice(8),
        sortNo: e.target.getAttribute('data-sortno') || 0,
      }).then(() => {
        this.getCustomShortCut();
      });
    } else {
      customShortCutUpdateSortNo(data, e.target.getAttribute('data-sortno') || 0).then(() => {
        this.getCustomShortCut();
      });
    }
  };

  allowDrop = e => {
    e.preventDefault();
    // e.target.style.borderRight = '2px solid #008FDB';
  };

  handleCancel = () => {
    this.setState({
      isVisible: false,
    });
  };

  clickMenu = item => {
    if (item.powerFlag) {
      if (item.shortcutUrl) {
        router.push(item.shortcutUrl);
      }
    } else {
      message({ type: 'warn', content: '您暂无该功能权限！' });
    }
  };

  render() {
    const { menuData = [], mode, workTableHome, currentPage = '/user/home' } = this.props;
    const { navTree, navCheckedKeys } = workTableHome;
    const { isVisible, saveLoading } = this.state;
    return (
      <div className={styles.wrapper}>
        <ul id="wrapper">
          {menuData.map(
            (menuItem, index) =>
              mode === 'edit' ? (
                <li
                  draggable="true"
                  id={menuItem.id}
                  data-sortno={menuItem.sortNo}
                  onDragStart={this.drag}
                  onDrop={this.drop}
                  onDragOver={this.allowDrop}
                  key={menuItem.id}
                  onClick={() => {
                    this.clickMenu(menuItem);
                  }}
                >
                  <Icon
                    className={`${styles.shakeli} ${styles.closeIcon}`}
                    type="close"
                    onClick={e => this.handleClose(menuItem, e)}
                  />

                  {menuItem.shortcutIcon ? (
                    <Icon type={`${menuItem.shortcutIcon}`} style={{ color: '#008FDB' }} />
                  ) : (
                    <Icon type="file" style={{ color: '#008FDB' }} />
                  )}
                  {menuItem.shortcutName}
                </li>
              ) : (
                <li
                  onClick={() => {
                    this.clickMenu(menuItem);
                  }}
                >
                  {menuItem.shortcutIcon ? (
                    <Icon type={`${menuItem.shortcutIcon}`} style={{ color: '#008FDB' }} />
                  ) : (
                    <Icon type="file" style={{ color: '#008FDB' }} />
                  )}
                  {menuItem.shortcutName}
                </li>
              )
          )}

          {mode === 'edit' && (
            <li>
              <Tag
                onClick={this.showMenu}
                className={styles.addTag}
                style={{
                  background: '#fff',
                  borderStyle: 'dashed',
                  cursor: 'pointer !important',
                  borderColor: '#1890ff',
                  color: '#1890ff',
                }}
              >
                <Icon type="plus" />
                新增
              </Tag>
            </li>
          )}
        </ul>
        <Modal
          title="自定义入口"
          visible={isVisible}
          confirmLoading={saveLoading}
          onOk={this.handleNavsSave}
          onCancel={this.handleCancel}
        >
          <ReactiveWrapper>
            <NavsTree checkedKeys={navCheckedKeys} treeData={navTree} onChange={this.handleNavs} />
          </ReactiveWrapper>
        </Modal>
      </div>
    );
  }
}

export default customShortcutMenu;
