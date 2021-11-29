/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Input, Form, Progress, Spin, Card } from 'antd';
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

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'targetMgmt';

@connect(({ loading, targetMgmt, dispatch }) => ({
  targetMgmt,
  dispatch,
  loading,
}))
@Form.create({})
@mountToTab()
class TargetMgmt extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') &&
      dispatch({ type: `${DOMAIN}/clean` }).then(res => {
        dispatch({ type: `${DOMAIN}/queryImplementList` }).then(response => {
          dispatch({
            type: `${DOMAIN}/targetMap`,
            payload: {
              okrPeriodId: response.id,
            },
          });
        });
      });
  }

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator },
      targetMgmt: { targetMapFormData, targetMapList, implementList },
    } = this.props;

    const spinLoading = loading.effects[`${DOMAIN}/targetMap`];

    return (
      <PageHeaderWrapper title="目标地图">
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <Spin style={{ width: '100%' }} spinning={spinLoading}>
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="okrPeriodId"
                label="目标周期"
                decorator={{
                  initialValue: targetMapFormData.id || undefined,
                }}
              >
                <Selection
                  className="x-fill-100"
                  source={[{ id: 0, periodName: '全部周期' }, ...implementList]}
                  transfer={{ key: 'id', code: 'id', name: 'periodName' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  onValueChange={e => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        targetMapList: [],
                      },
                    });
                    if (e) {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          targetMapFormData: e,
                        },
                      });
                      dispatch({
                        type: `${DOMAIN}/targetMap`,
                        payload: {
                          okrPeriodId: e.id || null,
                        },
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          targetMapFormData: {},
                        },
                      });
                    }
                  }}
                  placeholder="请选择目标周期"
                />
              </Field>
            </FieldList>
            {!isEmpty(targetMapList) ? (
              <TreeMap
                id={genFakeId(-1)}
                dataSource={{
                  id: genFakeId(-1),
                  objectiveName: targetMapFormData.periodName,
                  objectiveSubjectName: '',
                  children: targetMapList,
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bolder',
                  marginBottom: '20px',
                }}
              >
                暂无相关目标
              </div>
            )}
          </Spin>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TargetMgmt;
