import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Radio, Divider, Tooltip } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;

const DOMAIN = 'prefCheck';

@connect(({ loading, prefCheck, dispatch }) => ({
  loading,
  prefCheck,
  dispatch,
}))
@mountToTab()
class PrefCheckView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const {
      prefCheck: { formData },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: formData.pointViewList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '考核点来源',
          dataIndex: 'pointSourceName',
          align: 'center',
        },
        {
          title: '考核点',
          dataIndex: 'pointUdcName',
          align: 'center',
        },
        {
          title: '评分类型',
          dataIndex: 'poinTypeName',
          align: 'center',
        },
        {
          title: '权重',
          dataIndex: 'weight',
          align: 'center',
          render: (value, row, index) =>
            row.poinType === '2' || row.poinType === '3' ? null : `${value}%`,
        },
        {
          title: '评分标准',
          dataIndex: 'standardDesc',
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
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
              closeThenGoto(`/user/center/myVacation/prefCheck?_refresh=0`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="绩效考核模板详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="模板名称">{formData.tmplName || ''}</Description>
            <Description term="分数上下限">
              {`${formData.scoreMin || '0'} ~ ${formData.scoreMax || ''}`}
            </Description>
            <Description term="是否启用">
              {formData.enabledFlag && formData.enabledFlag === 'YES' && <pre>是</pre>}
              {formData.enabledFlag && formData.enabledFlag === 'NO' && <pre>否</pre>}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="考核结果等级">{formData.gradeCheck || ''}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="考核点" size="large" col={1}>
            <DataTable {...tableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckView;
