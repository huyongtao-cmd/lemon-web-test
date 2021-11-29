import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Radio, Button, Divider, Switch } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import moment from 'moment';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const { Field, FieldLine } = FieldList;
const { Description } = DescriptionList;
const DOMAIN = 'baseChangeFlow';

@connect(({ loading, baseChangeFlow, dispatch, user }) => ({
  loading,
  baseChangeFlow,
  dispatch,
  user,
}))
@mountToTab()
class BaseBUDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/fetchDetail`,
      payload: id,
    });
  }

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      baseChangeFlow: { baseBuList },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    const { id, mode } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A61', title: 'BaseBU变更申请' }];
    const tableProps = {
      sortBy: 'id',
      rowKey: 'chkItemId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      // loading: disabledBtn,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkMethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItem',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        {!mode ? (
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                const { from } = fromQs();
                closeThenGoto(markAsTab(from));
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
        ) : null}
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="BaseBU变更申请" />}
          bordered={false}
        >
          <DescriptionList title="原BU" size="large" col={2}>
            <Description term="变更资源">{baseBuList.resName || ''}</Description>
            <Description term="BaseBU">{baseBuList.oldBuName || ''}</Description>
            <Description term="上级资源">{baseBuList.oldPResName || ''}</Description>
          </DescriptionList>
        </Card>
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <DescriptionList title="新BU" size="large" col={2}>
            <Description term="新BaseBU">{baseBuList.newBuName || ''}</Description>
            <Description term="上级资源">{baseBuList.newPResName || ''}</Description>
            <Description term="加入时间">{baseBuList.dateFrom || ''}</Description>
            <Description term="合作方式">{baseBuList.coopTypeName || ''}</Description>
            <Description term="当量系数">{baseBuList.eqvaRatio || ''}</Description>
            <Description term="当量系数有效期"> {baseBuList.date || ''} </Description>
            <Description term="发薪方式">{baseBuList.salaryMethodName || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1} noTop>
            <Description term="发薪周期">
              {<pre>{baseBuList.salaryPeriodName}</pre> || ''}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1} noTop>
            <Description term="BU角色">{<pre>{baseBuList.roleCodeStr}</pre> || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1} noTop>
            <Description term="变更说明">{<pre>{baseBuList.changeDesc}</pre> || ''}</Description>
          </DescriptionList>
          <DescriptionList noTop>
            <Description term="申请人">{baseBuList.applyResName || ''}</Description>
            <Description term="申请日期">{baseBuList.applyDate || ''}</Description>
          </DescriptionList>
        </Card>
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <DescriptionList title="办理事项" size="large" col={2}>
            <DataTable {...tableProps} dataSource={baseBuList.chkViewList} />
          </DescriptionList>
        </Card>
        {!mode ? <BpmConnection source={allBpm} /> : null}
      </PageHeaderWrapper>
    );
  }
}

export default BaseBUDetail;
