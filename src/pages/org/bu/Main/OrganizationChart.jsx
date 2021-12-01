/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Form, Progress, Spin, Card } from 'antd';
import { mountToTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { Selection } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import createMessage from '@/components/core/AlertMessage';
import { selectUsersWithBu } from '@/services/gen/list';
import { isEmpty } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';

import TreeMap from './TreeMap';
import TreeMapBrief from './TreeMapBrief';

const DOMAIN = 'targetMgmt';

@connect(({ loading, targetMgmt, dispatch }) => ({
  targetMgmt,
  dispatch,
  loading,
}))
@Form.create({})
@mountToTab()
class TargetMgmt extends PureComponent {
  state = {
    mode: 'detail',
    treeData: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getTreeData`,
      payload: {
        specialBuNo: 'P101',
        simple: false,
      },
    }).then(response => {
      this.setState({
        treeData: response,
      });
    });
  }

  changeMode = mode => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getTreeData`,
      payload: {
        specialBuNo: 'P101',
        simple: mode === 'brief',
      },
    }).then(response => {
      this.setState({
        treeData: response,
        mode,
      });
    });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator },
      targetMgmt,
    } = this.props;
    const { mode, treeData } = this.state;
    const spinLoading = loading.effects[`${DOMAIN}/getTreeData`];

    return (
      <PageHeaderWrapper title="组织架构图">
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <Spin style={{ width: '100%' }} spinning={spinLoading}>
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
              <div>
                <Button
                  type={mode === 'detail' ? 'primary' : 'normal'}
                  size="large"
                  style={{ fontSize: 18, padding: '5px 18px', marginRight: 20 }}
                  onClick={() => this.changeMode('detail')}
                >
                  详细版
                </Button>
                <Button
                  type={mode === 'brief' ? 'primary' : 'normal'}
                  size="large"
                  style={{ fontSize: 18, padding: '5px 18px' }}
                  onClick={() => this.changeMode('brief')}
                >
                  简洁版
                </Button>
              </div>
            </FieldList>
            {!isEmpty(treeData) ? (
              mode === 'detail' ? (
                <TreeMap
                  id={genFakeId(-1)}
                  dataSource={{
                    id: genFakeId(-1),
                    children: treeData[0]?.children ?? [],
                    // children: listData()?.children ?? [],
                  }}
                  mode="detail"
                />
              ) : (
                <TreeMapBrief
                  id={genFakeId(-2)}
                  dataSource={{
                    id: genFakeId(-2),
                    children: treeData[0]?.children ?? [],
                    // children: listData()?.children ?? [],
                  }}
                  mode="brief"
                />
              )
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bolder',
                  marginBottom: '20px',
                }}
              >
                暂无组织架构图
              </div>
            )}
          </Spin>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TargetMgmt;
