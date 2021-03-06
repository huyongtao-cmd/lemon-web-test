import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import update from 'immutability-helper';

import { fromQs } from '@/utils/stringUtils';
import { genFakeId } from '@/utils/mathUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { Selection } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import { selectRoleCode } from '@/services/sys/system/report';

const DOMAIN = 'reportMgtDetail';
const { Description } = DescriptionList;

@connect(({ loading, reportMgtDetail, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  reportMgtDetail,
}))
@mountToTab()
class ReportMgtDetail extends PureComponent {
  state = {
    roleId: 0,
    sourceKey: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: id,
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      reportMgtDetail: { roleData },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        roleData: update(roleData, {
          [rowIndex]: {
            [rowField]: {
              $set:
                rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
            },
          },
        }),
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      reportMgtDetail: { formData, roleData },
    } = this.props;
    const { parameViews } = formData;
    const { id } = fromQs();
    const { roleId, sourceKey } = this.state;

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
      dataSource: parameViews,
      columns: [
        {
          title: '????????????',
          dataIndex: 'parameName',
        },
        {
          title: '????????????',
          dataIndex: 'parameVar',
        },
        {
          title: '?????????',
          dataIndex: 'parameVal',
        },
        {
          title: '????????????',
          dataIndex: 'parameTypeDesc',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'parameDefDesc',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'showFlagDesc',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'id',
          align: 'center',
          render: (value, row, index) => (
            <span
              style={{ color: '#008FDB', cursor: 'pointer' }}
              onClick={() => {
                const { sourceKey } = row;
                this.setState({
                  roleId: value,
                  sourceKey,
                });
                dispatch({
                  type: `${DOMAIN}/queryRoleList`,
                  payload: {
                    reportCode: row.reportCode,
                    paramId: value,
                  },
                });
              }}
            >
              ????????????
            </span>
          ),
        },
      ],
    };

    const authTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      pagination: false,
      showCopy: false,
      dataSource: roleData,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            roleData: update(roleData, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            roleData: roleData.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
          },
        });
      },
      columns: [
        {
          title: '??????',
          dataIndex: 'roleCode',
          align: 'center',
          required: true,
          width: '40%',
          options: {
            rules: [
              {
                required: true,
                message: '???????????????',
              },
            ],
          },
          render: (value, row, index) => (
            <Selection
              placeholder="???????????????"
              source={selectRoleCode}
              value={value}
              onChange={this.onCellChanged(index, 'roleCode')}
            />
          ),
        },
        {
          title: '????????????',
          dataIndex: 'dataPowerType',
          align: 'center',
          width: '60%',
          options: {
            rules: [
              {
                required: true,
                message: '?????????????????????',
              },
            ],
          },
          render: (value, row, index) => (
            <Selection.UDC
              placeholder="?????????????????????"
              code="TSK:REPORT_PARAM_POWER_TYPE"
              value={value}
              onChange={this.onCellChanged(index, 'dataPowerType')}
            />
          ),
        },
      ],
      buttons: [
        {
          key: 'save',
          title: '??????',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            roleData.map(v => (v['sourceKey'] = sourceKey));
            console.warn(roleData);
            dispatch({
              type: `${DOMAIN}/saveRole`,
              payload: {
                reportCode: formData.reportCode,
                paramId: roleId,
                roles: roleData,
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="??????????????????">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="form"
            size="large"
            onClick={() => closeThenGoto(`/sys/system/report/edit?id=${id}`)}
            hidden
          >
            {formatMessage({ id: `misc.edit`, desc: '??????' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/sys/system/report')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="????????????" />}
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="????????????">{formData.reportTitle}</Description>
            <Description term="????????????">{formData.showModeDesc}</Description>
            <Description term="????????????">{formData.reportCode}</Description>
            <Description term="????????????">
              {formData.reportStatus === '1' ? '??????' : '??????'}
            </Description>
            <Description term="????????????">{formData.reportTypeDesc}</Description>
            <Description term="????????????">{formData.reportUrl}</Description>
            {/* <Description style={{ visibility: 'hidden' }} term="??????">
              ??????
            </Description> */}
            <Description term="??????">
              <pre>{formData.reportMark}</pre>
            </Description>
          </DescriptionList>
          {/* <DescriptionList size="large" col={1}>
            <Description term="????????????">{formData.oppoName}</Description>
          </DescriptionList> */}
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="????????????" />}
          style={{ marginTop: 6 }}
        >
          <DataTable {...tableProps} />
          {!!roleId && (
            <>
              <Divider dashed />
              <div className="tw-card-title" style={{ marginBottom: 10 }}>
                ????????????
                <span style={{ marginLeft: 20, color: 'red' }}>
                  ??????????????????????????????????????????????????????
                </span>
              </div>
              <EditableDataTable {...authTableProps} />
            </>
          )}
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="???????????????" />}
          style={{ marginTop: 6 }}
        >
          <DescriptionList size="large" col={1}>
            <Description term="????????????">{formData.relatedNames}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ReportMgtDetail;
