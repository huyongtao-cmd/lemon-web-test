import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Tooltip, Input } from 'antd';
import { connect } from 'dva';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';

const { Description } = DescriptionList;

const DOMAIN = 'abstractChangesDetail';

@connect(({ loading, abstractChangesDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  abstractChangesDetail,
  dispatch,
  user,
}))
@mountToTab()
class AbstractChangesDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryDetailById`,
      payload: {
        id: param.id,
      },
    });
  }

  renderTable = () => {
    const {
      loading,
      abstractChangesDetail: { formData },
    } = this.props;
    const { newList } = formData;
    const field = [];
    if (Array.isArray(newList)) {
      newList.forEach(list => {
        const tableProps = {
          rowKey: 'id',
          columnsCache: DOMAIN,
          loading,
          pagination: false,
          enableSelection: false,
          total: 0,
          dataSource: list.data,
          showSearch: false,
          columns: [
            {
              title: '变更字段',
              dataIndex: 'changeLabel',
              align: 'center',
              width: 50,
            },
            {
              title: '变更前',
              dataIndex: 'beforeValue',
              align: 'center',
              width: 50,
              render: (value, row, index) => {
                if (
                  row.changeField === 'totalsControlFlag' ||
                  row.changeField === 'budgetControlFlag'
                ) {
                  // eslint-disable-next-line no-param-reassign
                  value = Number(value) === 1 ? '是' : '否';
                }
                return <span>{value}</span>;
              },
            },
            {
              title: '差异',
              dataIndex: 'deltaValue',
              align: 'center',
              width: 50,
              // render: (value, row, index) => {
              //   if (
              //     row.changeField === 'totalsControlFlag' ||
              //     row.changeField === 'budgetControlFlag'
              //   ) {
              //     // eslint-disable-next-line no-param-reassign
              //     value = Number(value) === 1 ? '是' : '否';
              //   }
              //   return <span>{value}</span>;
              // },
            },
            {
              title: '变更后',
              dataIndex: 'afterValue',
              align: 'center',
              width: 50,
              render: (value, row, index) => {
                if (
                  row.changeField === 'totalsControlFlag' ||
                  row.changeField === 'budgetControlFlag'
                ) {
                  // eslint-disable-next-line no-param-reassign
                  value = Number(value) === 1 ? '是' : '否';
                }
                return <span>{value}</span>;
              },
            },
            {
              title: '变更备注',
              dataIndex: 'changeOpinion',
              align: 'center',
              width: 200,
            },
          ],
        };
        field.push(
          <>
            <Divider dashed />
            <DescriptionList size="large" col={1} title={`${list.viewGroupName}`}>
              <DataTable {...tableProps} />
            </DescriptionList>
          </>
        );
      });
    }
    return field;
  };

  render() {
    const {
      dispatch,
      loading,
      abstractChangesDetail: { formData },
    } = this.props;
    const { newList } = formData;
    const { mode } = fromQs();
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
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <DescriptionList size="large" col={2} title="预算变更基本信息">
            <Description term="申请人">{formData.applyResName || ''}</Description>
            <Description term="申请时间">{formData.applyTime || undefined}</Description>
            <Description term="变更状态">{formData.changeStatusName || undefined}</Description>
            <Description term="变更简述">{formData.changeBrief || undefined}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="变更说明">{<pre>{formData.remark}</pre> || ''}</Description>
          </DescriptionList>
          {Array.isArray(newList) && newList.length > 0 ? this.renderTable() : null}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AbstractChangesDetail;
