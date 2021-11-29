import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { Button, Card, Form, Input, Radio, InputNumber, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const { Description } = DescriptionList;

const DOMAIN = 'vacationApply';

@connect(({ loading, vacationApply, dispatch }) => ({
  loading,
  vacationApply,
  dispatch,
}))
@mountToTab()
class VacationApplyView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          resVacationApply: {},
          recentResVacationList: [],
          resVacationList: [],
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const {
      loading,
      dispatch,
      vacationApply: {
        formData: { resVacationApply, recentResVacationList, resVacationList },
      },
    } = this.props;
    const { detailViewList } = resVacationApply;

    const holidayTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: detailViewList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '月份',
          dataIndex: 'vmonth',
          align: 'center',
        },
        {
          title: '日期',
          dataIndex: 'vdate',
          align: 'center',
        },
        {
          title: '天数',
          dataIndex: 'vdays',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(from);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.vacation.view" defaultMessage="请假申请详情" />
          }
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="请假人">{resVacationApply.apprResName || ''}</Description>
            <Description term="BaseBU">{resVacationApply.buName || ''}</Description>
            <Description term="直属领导">{resVacationApply.presName || ''}</Description>
            <Description term="所属公司">{resVacationApply.ouName || ''}</Description>
            <Description term="假期类型">{resVacationApply.vacationTypeDesc || ''}</Description>
            <Description term="请假开始日期/结束日期">
              {resVacationApply.startDate || ''}
              {resVacationApply.endDate ? '-' : ''}
              {resVacationApply.endDate || ''}
            </Description>
            <Description term="请假天数">{resVacationApply.vacationDays || ''}</Description>
            <Description term="请假事由">
              <pre>{resVacationApply.reason || ''}</pre>
            </Description>
            <Description term="附件">
              <FileManagerEnhance
                api="/api/person/v1/vacationApply/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              />
            </Description>
            <Description term="补充附件">
              <FileManagerEnhance
                api="/api/person/v1/vacationApply/supply/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              />
            </Description>
            <Description term="工作安排">
              <pre>{resVacationApply.workPlan || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList title="请假明细" size="large" col={1}>
            <DataTable {...holidayTableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VacationApplyView;
