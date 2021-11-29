/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';

import { Button, Card, Form, Input, Select, TimePicker } from 'antd';
import classnames from 'classnames';
import { CreateThemeModel } from './components';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import styles from './index.less';

const DOMAIN = 'systemTheme';
@connect(({ loading, systemTheme }) => ({
  systemTheme,
  loading,
}))
class Theme extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      themeModel: false,
      selectedId: '',
      mode: '',
    };
  }

  componentDidMount() {
    this.getQuery();
  }

  getQuery = () => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
  };

  // 主题的新增
  handleCreate = () => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanState` });
    this.setState({
      themeModel: true,
    });
  };

  // 主题的修改
  handleEdit = () => {
    const { dispatch, systemTheme } = this.props;
    const { selectedItem } = systemTheme;
    if (selectedItem.id) {
      dispatch({ type: `${DOMAIN}/getThemeById`, payload: { id: selectedItem.id } }).then(res => {
        if (res.ok)
          this.setState({
            themeModel: true,
            mode: 'edit',
          });
      });
    } else {
      createMessage({ type: 'error', description: '请选中主题' });
    }
  };

  // 查看注主题
  handleView = () => {
    const { dispatch, systemTheme } = this.props;
    const { selectedItem } = systemTheme;
    const { id, panelType } = selectedItem;
    if (selectedItem.id) {
      router.push(`/sys/system/theme/index?id=${id}&panelType=${panelType}`);
      dispatch({ type: `${DOMAIN}/selectedItem`, payload: { selectedItem: {} } });
    } else {
      createMessage({ type: 'error', description: '请选中主题' });
    }
  };

  // 删除主题
  deleteTheme = () => {
    const { dispatch, systemTheme } = this.props;
    const { selectedItem } = systemTheme;
    if (selectedItem.id) {
      dispatch({ type: `${DOMAIN}/deleteTheme`, payload: { id: selectedItem.id } });
    } else {
      createMessage({ type: 'error', description: '请选中主题' });
    }
  };

  themeModelProps = () => {
    const { dispatch, systemTheme } = this.props;
    const { themeModel, mode } = this.state;
    const { themeItem } = systemTheme;
    return {
      title: '新增主题',
      visible: themeModel,
      width: '50%',
      themeItem,
      mode,
      dispatch,
      DOMAIN,
      onCancel: () => {
        this.setState({
          themeModel: false,
          mode: '',
        });
      },
      onOk: () => {
        this.setState({
          themeModel: false,
          mode: '',
        });
      },
    };
  };

  render() {
    const { themeModel } = this.state;
    const { systemTheme, dispatch } = this.props;
    const { themeList, selectedItem } = systemTheme;
    return (
      <PageHeaderWrapper title="合作伙伴">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="add"
            // loading=""
            size="large"
            onClick={this.handleCreate}
          >
            新增
          </Button>
          <Button
            className="tw-btn-primary"
            icon="add"
            // loading=""
            size="large"
            onClick={this.handleEdit}
          >
            修改
          </Button>
          <Button
            className="tw-btn-primary"
            // loading=""
            size="large"
            onClick={this.handleView}
          >
            查看
          </Button>

          <Button className="tw-btn-primary" icon="undo" size="large" onClick={this.deleteTheme}>
            删除
          </Button>
        </Card>
        <Card className="tw-card-rightLine">
          <div className={styles['menu-box']}>
            {themeList.map(item => (
              <div
                className={`${styles.menu_item} ${
                  selectedItem.id === item.id ? styles.activeItem : ''
                }`}
                key={item.id}
                onClick={() => {
                  dispatch({ type: `${DOMAIN}/selectedItem`, payload: item });
                }}
              >
                <img
                  alt="example"
                  width="100%"
                  height="100%"
                  src={`data:image/jpeg;base64,${item.imgFile}`}
                />
              </div>
            ))}
          </div>
        </Card>
        {themeModel && <CreateThemeModel {...this.themeModelProps()} />}
      </PageHeaderWrapper>
    );
  }
}

export default Theme;
