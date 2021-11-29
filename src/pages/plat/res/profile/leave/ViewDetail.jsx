import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import classnames from 'classnames';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Radio,
  TimePicker,
  InputNumber,
  Select,
  Switch,
  Checkbox,
} from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import { pushFlowTask } from '@/services/gen/flow';
import { stringify } from 'qs';
import { selectInternalOus } from '@/services/gen/list';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;

const DOMAIN = 'leave';

@connect(({ leave }) => ({
  leave,
}))
@mountToTab()
class ViewDetail extends Component {
  // componentDidMount() {
  //   const { dispatch } = this.props;
  //   const { id } = fromQs();
  //   id &&
  //     dispatch({
  //       type: `${DOMAIN}/query`,
  //       payload: id,
  //     }).then(res => {
  //       const { applyDate, resId } = res;
  //       dispatch({ type: `${DOMAIN}/myVacationList`, payload: { resId, applyDate } });
  //     });
  //   id &&
  //     dispatch({
  //       type: `${DOMAIN}/checkresultList`,
  //       payload: id,
  //     });
  // }

  render() {
    const {
      loading,
      leave: {
        formData,
        resChkData,
        finChkData,
        offiChkData,
        hrChkData,
        ITChekData,
        myVacationList,
      },
    } = this.props;

    const holidayTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: myVacationList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '年度',
          dataIndex: 'vacationYear',
          align: 'center',
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeName',
          align: 'center',
        },
        {
          title: '起始日期',
          dataIndex: 'startDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '截止日期',
          dataIndex: 'endDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '有效期',
          dataIndex: 'expirationDate',
          align: 'center',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '总数',
          dataIndex: 'totalDays',
          align: 'center',
        },
        {
          title: '已用',
          dataIndex: 'usedDays',
          align: 'center',
        },
        {
          title: '可用',
          dataIndex: 'availableDays',
          align: 'center',
        },
      ],
    };
    const leavelResTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '检查事项',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, index) => <pre>{value}</pre>,
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.res.leaveApply" defaultMessage="离职申请" />
          }
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="资源">{formData.resName || ''}</Description>
            <Description term="入职日期">{formData.enrollDate || ''}</Description>
            <Description term="BaseBU">{formData.baseBuName || ''}</Description>
            <Description term="Base地">{formData.baseCityName || ''}</Description>
            <Description term="所属公司">{formData.ouName || ''}</Description>
            <Description term="直属领导">{formData.presName || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1} style={{ marginTop: '-32px' }}>
            <Description term="离职原因">
              <pre>{formData.leaveDesc}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2} style={{ marginTop: '-48px' }}>
            <Description term="有无工作交接">
              {formData.jobHandOverFlag === 1 && <pre>有</pre>}
              {formData.jobHandOverFlag === 0 && <pre>无</pre>}
            </Description>
            <Description term="工作交接人">{formData.jobHandOverName || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1} style={{ marginTop: '-45px' }}>
            <Description term="工作交接内容">
              <pre>{formData.jobContent}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2} style={{ marginTop: '-30px' }}>
            <Description term="最后工作日">{formData.lastJobDate || ''}</Description>
            <Description term="解除劳动合同日期">{formData.contractEndDate || ''}</Description>
            <Description term="邮箱设置">
              {formData.emailSet === 'CLOSE' && '直接关闭'}
              {formData.emailSet === 'RECEIVER' && '设置代收人'}
            </Description>
            <Description term="邮件代收人">{formData.emailReceiverName || ''}</Description>
            <Description term="工号">{formData.empNo || ''}</Description>
            <Description term="邮箱">{formData.email || ''}</Description>
            <Description term="申请人">{formData.applyResName || ''}</Description>
            <Description term="申请时间">{formData.applyDate || ''}</Description>
          </DescriptionList>
        </Card>
        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="ui.menu.plat.res.holiday" defaultMessage="剩余假期" />}
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <Checkbox
            style={{ marginLeft: '30px' }}
            checked={formData.vacationFlag === '已安排'}
            disabled
          >
            已安排休完剩余假期
          </Checkbox>
          <DataTable {...holidayTableProps} />
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.res.leavelRes"
              defaultMessage="离职办理事项-离职资源"
            />
          }
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...leavelResTableProps} dataSource={resChkData} />
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.res.leavelFinance"
              defaultMessage="离职办理事项-财务"
            />
          }
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...leavelResTableProps} dataSource={finChkData} />
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.res.leavelAdm"
              defaultMessage="离职办理事项-行政"
            />
          }
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...leavelResTableProps} dataSource={offiChkData} />
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.res.leavelPerson"
              defaultMessage="离职办理事项-人事"
            />
          }
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...leavelResTableProps} dataSource={hrChkData} />
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="ui.menu.plat.res.leavelIT" defaultMessage="离职事项办理-IT" />
          }
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...leavelResTableProps} dataSource={ITChekData} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ViewDetail;
