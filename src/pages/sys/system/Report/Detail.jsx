import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { FileManagerEnhance } from '@/pages/gen/field';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'reportMgtDetail';
const { Description } = DescriptionList;

@connect(({ loading, reportMgtDetail, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  reportMgtDetail,
}))
@mountToTab()
class ReportMgtDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: id,
    });
  }

  render() {
    const {
      dispatch,
      loading,
      reportMgtDetail: { formData },
    } = this.props;
    const { id } = fromQs();

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      filterMultiple: false,
      enableSelection: false,
      pagination: false,
      dataSource: formData.parameViews,
      // total,
      columns: [
        {
          title: '条件名称',
          dataIndex: 'parameName',
        },
        {
          title: '条件变量',
          dataIndex: 'parameVar',
        },
        {
          title: '默认值',
          dataIndex: 'parameVal',
        },
        {
          title: '条件类型',
          dataIndex: 'parameTypeDesc',
          align: 'center',
        },
        {
          title: '条件定义',
          dataIndex: 'parameDefDesc',
          align: 'center',
        },
        {
          title: '是否启用',
          dataIndex: 'showFlagDesc',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="销售合同详情">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="form"
            size="large"
            onClick={() => closeThenGoto(`/sys/system/report/edit?id=${id}`)}
            hidden
          >
            {formatMessage({ id: `misc.edit`, desc: '编辑' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/sys/system/report')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="报表信息" />}
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="报表名称">{formData.reportTitle}</Description>
            <Description term="显示模式">{formData.showModeDesc}</Description>
            <Description term="报表编码">{formData.reportCode}</Description>
            <Description term="是否显示">
              {formData.reportStatus === '1' ? '显示' : '隐藏'}
            </Description>
            <Description term="报表类型">{formData.reportTypeDesc}</Description>
            <Description term="排序(倒序)">{formData.reportSort}</Description>
            <Description term="链接预览">{formData.reportUrl}</Description>
            {/* <Description style={{ visibility: 'hidden' }} term="占位">
              占位
            </Description> */}
            <Description term="备注">
              <pre>{formData.reportMark}</pre>
            </Description>
          </DescriptionList>
          {/* <DescriptionList size="large" col={1}>
            <Description term="报表权限">{formData.oppoName}</Description>
          </DescriptionList> */}
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="报表配置" />}
          style={{ marginTop: 6 }}
        >
          <DataTable {...tableProps} />
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="相关联报表" />}
          style={{ marginTop: 6 }}
        >
          <DescriptionList size="large" col={1}>
            <Description term="相关报表">{formData.relatedNames}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ReportMgtDetail;
