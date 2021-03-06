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
          title: '??????',
          dataIndex: 'vmonth',
          align: 'center',
        },
        {
          title: '??????',
          dataIndex: 'vdate',
          align: 'center',
        },
        {
          title: '??????',
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
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.vacation.view" defaultMessage="??????????????????" />
          }
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="?????????">{resVacationApply.apprResName || ''}</Description>
            <Description term="BaseBU">{resVacationApply.buName || ''}</Description>
            <Description term="????????????">{resVacationApply.presName || ''}</Description>
            <Description term="????????????">{resVacationApply.ouName || ''}</Description>
            <Description term="????????????">{resVacationApply.vacationTypeDesc || ''}</Description>
            <Description term="??????????????????/????????????">
              {resVacationApply.startDate || ''}
              {resVacationApply.endDate ? '-' : ''}
              {resVacationApply.endDate || ''}
            </Description>
            <Description term="????????????">{resVacationApply.vacationDays || ''}</Description>
            <Description term="????????????">
              <pre>{resVacationApply.reason || ''}</pre>
            </Description>
            <Description term="??????">
              <FileManagerEnhance
                api="/api/person/v1/vacationApply/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              />
            </Description>
            <Description term="????????????">
              <FileManagerEnhance
                api="/api/person/v1/vacationApply/supply/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              />
            </Description>
            <Description term="????????????">
              <pre>{resVacationApply.workPlan || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList title="????????????" size="large" col={1}>
            <DataTable {...holidayTableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VacationApplyView;
