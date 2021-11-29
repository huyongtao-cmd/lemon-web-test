import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import DetailEntityTable from './DetailEntityTable';
import FormItem from '@/components/production/business/FormItem.tsx';

const { Description } = DescriptionList;

const DOMAIN = 'vacationApplyNew';

@connect(({ loading, vacationApplyNew, dispatch }) => ({
  loading,
  ...vacationApplyNew,
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
      formData: { resVacationApply, recentResVacationList, resVacationList },
      attachments,
      hrattachments,
      addattachments,
    } = this.props;
    const { detailViewList, apprStatus } = resVacationApply;

    const { id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'RES_R04', title: '员工请假流程' }];

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
        {/* <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              closeThenGoto(`/workTable/vacApply/vacLogListPage`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card> */}

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.vacation.view" defaultMessage="休假申请详情" />
          }
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="申请人">{resVacationApply.apprResName || ''}</Description>
            <Description term="申请日期">{resVacationApply.apprDate || ''}</Description>
            <Description term="申请单号">{resVacationApply.applyNo || ''}</Description>
            {/* <Description term="请假人">{resVacationApply.apprResName || ''}</Description> */}
            {/* <Description term="BaseBU">{resVacationApply.buName || ''}</Description>
            <Description term="直属领导">{resVacationApply.presName || ''}</Description>
            <Description term="所属公司">{resVacationApply.ouName || ''}</Description> */}
            <Description term="假期类型">{resVacationApply.vacationTypeDesc || ''}</Description>
            <Description term="请假开始/结束日期">
              {resVacationApply.startDate || ''}
              {resVacationApply.endDate ? '~' : ''}
              {resVacationApply.endDate || ''}
            </Description>
            <Description term="请假天数">{resVacationApply.vacationDays || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large">
            <Description term="申请人提交附件">
              {/* <FileManagerEnhance
                api="/api/production/vac/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              /> */}
              <FormItem
                fieldType="FileUpload"
                fieldKey="attachment"
                label="申请人提交附件"
                fileList={attachments}
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="事由">
              <pre>{resVacationApply.reason || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="工作安排">
              <pre>{resVacationApply.workPlan || ''}</pre>
            </Description>
          </DescriptionList>

          <DescriptionList size="large">
            <Description term="人事提交附件">
              {/* <FileManagerEnhance
                api="/api/production/vacAdd/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              /> */}
              <FormItem
                fieldType="FileUpload"
                fieldKey="hrAttachment"
                label="人事上传附件"
                fileList={hrattachments}
                preview
              />
            </Description>
            <Description term="休假后补充清单">
              {resVacationApply.addFlag === '1' && <pre>有</pre>}
              {resVacationApply.addFlag === '0' && <pre>无</pre>}
            </Description>
            <Description term="补充附件清单">
              <pre>{resVacationApply.addList || ''}</pre>
            </Description>
            <Description term="补充附件">
              {/* <FileManagerEnhance
                api="/api/production/vacAddAtt/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              /> */}
              <FormItem
                fieldType="FileUpload"
                fieldKey="addAttachment"
                fileList={addattachments}
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList title="请假明细" size="large" col={1}>
            <DetailEntityTable />
          </DescriptionList>
        </Card>
        <BpmConnection source={allBpm} />
      </PageHeaderWrapper>
    );
  }
}

export default VacationApplyView;
