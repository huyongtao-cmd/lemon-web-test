import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Tooltip } from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import { stringify } from 'qs';
import modal from './modal';

const { ProExpModal } = modal;

const DOMAIN = 'platResProfileProjectExperience';
const defaultVal = {
  id: null,
  resId: null, // 资源id
  dateFrom: null, // 时间
  dateTo: null, // 时间
  company: null, // 学校
  dutyAchv: null, // 学历
  industry: null, // 学制
  product: null, // 专业
  projIntro: null, // 专业描述
  projName: null, // 专业描述
  projRole: null, // 专业描述
  remark: null, // 专业描述
};
@connect(({ loading, platResProfileProjectExperience }) => ({
  platResProfileProjectExperience,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ProjectExperience extends PureComponent {
  state = {
    visible: false,
    formData: defaultVal,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { resId: param.id },
    });
  };

  handleOk = () => {
    const { formData } = this.state;
    const { dispatch } = this.props;
    const param = fromQs();
    // console.warn(formData);
    dispatch({
      type: `${DOMAIN}/save`,
      payload: { formData: { ...formData, resId: param.id } },
    }).then(() => {
      this.setState({
        visible: false,
        formData,
      });
      this.fetchData();
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      formData: {
        ...defaultVal,
      },
    });
  };

  proExpRangeSofar = flag => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { proExpSofarFlag: flag },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResProfileProjectExperience: { total, dataSource },
    } = this.props;
    const { visible, formData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 教育经历表格
    const tableProps = {
      rowKey: 'id',
      // columnsCache: DOMAIN,
      scroll: {
        x: '150%',
      },
      columnsCache: 'tableProps',
      loading: false,
      pagination: false,
      total,
      dataSource,
      showSearch: false,
      columns: [
        {
          title: '开始时间',
          dataIndex: 'dateFrom',
          render: val => (val ? moment(val).format('YYYY-MM') : ''),
          width: 70,
        },
        {
          title: '结束时间',
          dataIndex: 'dateTo',
          render: val => (val ? moment(val).format('YYYY-MM') : '至今'),
          width: 70,
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
          align: 'center',
        },
        {
          title: '相关产品',
          dataIndex: 'product',
          align: 'center',
        },
        {
          title: '相关行业',
          dataIndex: 'industry',
        },
        {
          title: '项目角色',
          dataIndex: 'projRole',
        },
        {
          title: '所在公司',
          dataIndex: 'company',
        },
        {
          title: '项目简介',
          dataIndex: 'projIntro',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '职责&业绩',
          dataIndex: 'dutyAchv',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              visible: true,
              formData: {
                ...defaultVal,
              },
            });
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              visible: true,
              formData: {
                ...selectedRows[0],
              },
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: selectedRowKeys,
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                const fromUrl = stringify({ from });
                closeThenGoto(`/hr/res/profile/list/background?id=${param.id}&${fromUrl}`);
              } else {
                closeThenGoto(`/hr/res/profile/list/background?id=${param.id}`);
              }
            }}
          >
            {formatMessage({ id: `misc.prevstep`, desc: '上一步' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                const fromUrl = stringify({ from });
                closeThenGoto(`/hr/res/profile/list/resCapacity?id=${param.id}&${fromUrl}`);
              } else {
                closeThenGoto(`/hr/res/profile/list/resCapacity?id=${param.id}`);
              }
            }}
          >
            {formatMessage({ id: `misc.nextstep`, desc: '下一步' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                closeThenGoto(from);
              } else {
                closeThenGoto('/hr/res/profile/list');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.res.projectExperience"
              defaultMessage="资源项目履历"
            />
          }
        >
          <DataTable {...tableProps} />
        </Card>

        <ProExpModal
          formData={formData}
          visible={visible}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
          handleSofar={this.proExpRangeSofar}
        />
      </PageHeaderWrapper>
    );
  }
}

export default ProjectExperience;
