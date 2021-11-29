import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Card, Col, Divider, Form, Input, Row, Select, TreeSelect } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import TreeSearch from '@/components/common/TreeSearch';
import { Selection } from '@/pages/gen/field';
import Loading from '@/components/core/DataLoading';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';

import styles from '../Help/help.less';

const DOMAIN = 'navTenantManage';
const columns = [
  { dataIndex: 'tenantCode', title: '编号', span: 12 },
  { dataIndex: 'tenantName', title: '名称', span: 12 },
];

/**
 * 系统菜单
 */
@connect(({ loading, navTenantManage, dispatch }) => ({
  treeLoading: loading.effects[`${DOMAIN}/getTree`],
  ...navTenantManage,
  dispatch,
}))
@mountToTab()
class NavTenantManage extends PureComponent {
  state = {};

  constructor(props) {
    super(props);
    this.treeRef = React.createRef();
  }

  componentDidMount() {
    this.callModelEffects('getTree');
    this.callModelEffects('getTenants', { limit: 0 });
  }

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  onCheck = (checkedKeys, info, parm3, param4) => {
    const allCheckedKeys = checkedKeys.concat(info.halfCheckedKeys);
    this.updateModelState({ checkedKeys, allCheckedKeys });
  };

  onTenantChange = value => {
    const { flatMenus } = this.props;
    this.callModelEffects('onTenantChange', { tenantId: value, flatMenus });
  };

  handleSave = () => {
    const { allCheckedKeys, tenantId, flatMenus } = this.props;
    this.callModelEffects('save', { tenantId, allCheckedKeys, flatMenus });
  };

  render() {
    const {
      treeLoading,
      tenants,
      tenantId,
      tree,
      defaultSelectedKeys,
      checkedKeys,
      dispatch,
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card>
          <Row gutter={5}>
            <Col span={2}>租户:</Col>
            <Col span={10}>
              <Selection.Columns
                transfer={{ key: 'id', code: 'id', name: 'tenantName' }}
                columns={columns}
                source={tenants}
                placeholder="请选择"
                showSearch
                value={tenantId}
                onChange={value => this.onTenantChange(value)}
              />
            </Col>
            <Col span={12} />
          </Row>
        </Card>

        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={treeLoading}
            onClick={() => this.handleSave()}
          >
            保存
          </Button>
          {/* <Button
            className="tw-btn-error"
            type="primary"
            size="large"
            loading={treeLoading}
            onClick={()=>{
              createConfirm({
                content: '确认删除所选记录？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/deleteAll`,
                    payload: { tenantId },
                  }),
              });
            }}
          >
            清除所有
          </Button> */}
        </Card>
        <Row gutter={5} className={styles['help-wrap']}>
          {/*  paddingTop 是为了跟右边顶部对齐 */}
          <Col span={24}>
            {!treeLoading ? (
              <TreeSearch
                checkable
                // checkStrictly
                showSearch={false}
                placeholder="请输入关键字"
                treeData={tree}
                defaultExpandedKeys={tree.map(item => `${item.id}`)}
                checkedKeys={checkedKeys}
                // defaultSelectedKeys={defaultSelectedKeys}
                onCheck={this.onCheck}
                ref={ref => {
                  this.treeRef = ref;
                }}
              />
            ) : (
              <Loading />
            )}
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default NavTenantManage;
