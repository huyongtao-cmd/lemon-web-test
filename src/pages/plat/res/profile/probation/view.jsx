import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Radio, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import router from 'umi/router';

const { Description } = DescriptionList;

const DOMAIN = 'probation';

@connect(({ loading, probation, dispatch }) => ({
  loading,
  probation,
  dispatch,
}))
@mountToTab()
class ProbationView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: id,
      });
    });
  }

  render() {
    const {
      probation: { formData },
      dispatch,
      loading,
    } = this.props;
    const evalList = [
      { evalPoint: '成长收获', evalStatusName: formData.selfEval1 || '' },
      { evalPoint: '近期工作成果', evalStatusName: formData.selfEval2 || '' },
      { evalPoint: '自我定位', evalStatusName: formData.selfEval3 || '' },
      { evalPoint: '需改进方面', evalStatusName: formData.selfEval4 || '' },
      { evalPoint: '建议', evalStatusName: formData.selfEval5 || '' },
    ];
    const selfTableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      expirys: 0,
      // total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      enableSelection: false,
      showExport: false,
      pagination: false,
      dataSource: evalList,
      columns: [
        {
          title: '自评项',
          dataIndex: 'evalPoint',
          align: 'center',
          width: '30%',
        },
        {
          title: '自评',
          dataIndex: 'evalStatusName',
          align: 'center',
          width: '70%',
        },
      ],
    };

    const leaderTableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      expirys: 0,
      // total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      enableSelection: false,
      showExport: false,
      pagination: false,
      dataSource: formData.viewbyPid,
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalPoint',
          align: 'center',
          width: '30%',
        },
        {
          title: '评分',
          dataIndex: 'evalScore',
          align: 'center',
          width: '35%',
        },
        {
          title: '简评',
          dataIndex: 'comment',
          align: 'center',
          width: '35%',
        },
      ],
    };

    const buTableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      expirys: 0,
      // total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      enableSelection: false,
      showExport: false,
      pagination: false,
      dataSource: formData.checkViewByBuId,
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalPoint',
          align: 'center',
          width: '30%',
        },
        {
          title: '评分',
          dataIndex: 'evalScore',
          align: 'center',
          width: '35%',
        },
        {
          title: '简评',
          dataIndex: 'comment',
          align: 'center',
          width: '35%',
        },
      ],
    };
    const { type } = fromQs();
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              router.goBack();
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text={`试用期考核${type}`} />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="资源">{formData.resName || ''}</Description>
            <Description term="BaseBU">{formData.buName || ''}</Description>
            <Description term="直属领导">{formData.personName || ''}</Description>
            <Description term="试用期">{formData.probationPeriod || ''}</Description>
            <Description term="评审结果">
              {<pre>{formData.buPicCheckResultDesc}</pre> || ''}
            </Description>
            <Description term="转正日期">{formData.buPicRegularDate || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="备注">{<pre>{formData.remark}</pre> || ''}</Description>
          </DescriptionList>
          <Divider dashed />
          <div className="tw-card-title">自评</div>
          <DataTable {...selfTableProps} />
          <Divider dashed />
          <div className="tw-card-title">直属领导评审</div>
          <DescriptionList size="large" col={1}>
            <Description term="总评">
              {
                <pre>
                  {(formData.viewbyPid &&
                    formData.viewbyPid[0] &&
                    formData.viewbyPid[0].evalComment) ||
                    ''}
                </pre>
              }
            </Description>
          </DescriptionList>
          <DataTable {...leaderTableProps} />
          <Divider dashed />
          <div className="tw-card-title">BU负责人评审</div>
          <DescriptionList size="large" col={1}>
            <Description term="总评">
              {
                <pre>
                  {(formData.checkViewByBuId &&
                    formData.checkViewByBuId[0] &&
                    formData.checkViewByBuId[0].evalComment) ||
                    ''}
                </pre>
              }
            </Description>
          </DescriptionList>
          <DataTable {...buTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProbationView;
