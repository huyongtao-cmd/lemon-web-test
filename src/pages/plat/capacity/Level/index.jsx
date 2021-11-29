import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Select } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { TagOpt } from '@/utils/tempUtils';

import DetailModal from './modal/detailModal';
import { reValidate } from '@/pages/gen/hint';
import { convertCode } from '@/components/core/I18n/convert';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'platCapaLevel';

@connect(({ loading, platCapaLevel }) => ({
  loading: loading.effects[`${DOMAIN}/fetch`],
  ...platCapaLevel,
}))
@mountToTab()
class UserCapaLevel extends PureComponent {
  state = {
    modalVisible: false,
    canEdit: false,
    canEditDet: true,
    confirmLoading: false,
    // formData: {
    //   levelStatus: '1',
    //   defFlag: 1,
    //   ...formDataModel,
    // },
  };

  componentDidMount() {
    this.fetchPageData();
  }

  // 提交弹出窗。
  submitModal = (e, value) => {
    // const { confirmLoading } = this.state;
    this.setState({
      confirmLoading: true,
    });
    const { modalVisible, canEdit, canEditDet } = this.state;
    const {
      dispatch,
      formData,
      formData: { leveldEntities },
    } = this.props;

    const isReValid = reValidate(
      leveldEntities,
      { name: 'leveldNo', label: '明细编号' },
      // { name: 'validMonths', label: '有效期长' },
      { name: 'leveldName', label: '名称' }
    );
    // 校验明细项
    if (!isReValid) {
      this.setState({
        confirmLoading: false,
      });
      return false;
    }

    // 是否可以编辑
    if (!canEdit && !canEditDet) {
      dispatch({
        type: `${DOMAIN}/clean`,
      });

      this.setState({
        modalVisible: !modalVisible,
        confirmLoading: false,
      });
      return false;
    }

    // To developer: 这里也是很无奈。。。这一块应该做成页面的，最早的开发做成弹窗，校验有点问题，所以这里就这样了。
    if (!(formData.levelName && formData.levelName.trim())) {
      createMessage({
        type: 'error',
        description: '级别名称必须填写',
      });
      this.setState({
        confirmLoading: false,
      });
      return false;
    }
    const newLeveldEntities = formData.leveldEntities.map((item, idx) => {
      const newItem = item;
      newItem.sortNo = idx + 1;
      return newItem;
    });
    formData.leveldEntities = newLeveldEntities;
    // 请求
    dispatch({
      type: `${DOMAIN}/save`,
      payload: formData,
    }).then(({ status, response: { ok, reason, datum, errCode } }) => {
      if (status === 100) {
        // 主动取消请求
        this.setState({
          confirmLoading: false,
        });
      }
      // console.log('ok, reason, datum, errCode ->', ok, reason, datum, errCode);
      // 如果有错误，log出来
      else if (!ok) {
        createMessage({
          type: 'error',
          description: reason, // convertCode(errCode),
        });
        this.setState({
          confirmLoading: false,
        });
      } else {
        dispatch({
          type: `${DOMAIN}/clean`,
        }).then(() => {
          createMessage({
            type: 'success',
            description: '保存成功',
          });
          this.setState({
            modalVisible: !modalVisible,
            confirmLoading: false,
          });
          this.fetchPageData();
        });
      }
    });
    return 0;
  };

  // cancel弹出窗。
  cancelModal = () => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  // 新增弹出窗。
  toggleCreateModal = () => {
    const { modalVisible } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    this.setState({
      modalVisible: !modalVisible,
      canEdit: true,
      canEditDet: false,
    });
  };

  // 修改弹出窗。
  toggleEditModal = (param, canEditDet) => {
    const { modalVisible } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          id: param.id,
          levelNo: param.levelNo,
          levelName: param.levelName,
          levelStatus: param.levelStatus,
          defFlag: param.defFlag,
          leveldEntities: param.leveldEntities,
        },
      },
    });
    this.setState({
      modalVisible: !modalVisible,
      canEdit: true,
      canEditDet: !!canEditDet,
    });
  };

  fetchPageData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  handleDetail = row => {
    this.toggleEditModal(row);
    this.setState({
      canEdit: false,
      canEditDet: false,
    });
  };

  render() {
    const { modalVisible, canEdit, canEditDet, confirmLoading } = this.state;
    const { loading, dispatch, dataSource, total, formData, searchForm } = this.props;

    // console.log('----formData', formData);
    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      // limit: stringUtils.queryURL('limit'),
      // offset: stringUtils.queryURL('offset'),
      sortDirection: 'DESC',
      scroll: {
        x: '40%',
        // y: 900,
      },
      columnsCache: DOMAIN,
      total,
      dataSource,
      loading: !!loading,
      expirys: 0,
      dispatch,
      showColumn: false,
      onRow: () => {},
      rowSelection: {
        type: 'radio',
      },
      onChange: filters => {
        this.fetchPageData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      enableDoubleClick: false,
      searchBarForm: [
        {
          title: '级别名称',
          dataIndex: 'levelName',
          options: {
            initialValue: searchForm.levelName,
          },
          tag: <Input placeholder="级别名称" />,
        },
        {
          title: '状态',
          dataIndex: 'levelStatus',
          tag: (
            <Select name="levelStatus" allowClear>
              <Select.Option value="ACTIVE">有效</Select.Option>
              <Select.Option value="INACTIVE">无效</Select.Option>
            </Select>
          ),
          options: {
            initialValue: searchForm.levelStatus,
          },
        },
        {
          title: '是否默认',
          dataIndex: 'defFlag',
          tag: (
            <Select name="defFlag" allowClear>
              <Select.Option value={1}>是</Select.Option>
              <Select.Option value={0}>否</Select.Option>
            </Select>
          ),
          options: {
            initialValue: searchForm.defFlag,
          },
        },
      ],
      columns: [
        {
          title: '级别名称',
          dataIndex: 'levelName',
          sorter: true,
          width: '40%',
          render: (value, row, index) => (
            <a className="tw-link" data-key={row.levelNo} onClick={() => this.handleDetail(row)}>
              {value}
            </a>
          ),
        },
        {
          title: '状态',
          dataIndex: 'levelStatus',
          width: '10%',
          align: 'center',
          render: status => (
            <TagOpt
              value={status}
              opts={[{ code: 'INACTIVE', name: '无效' }, { code: 'ACTIVE', name: '有效' }]}
              disablePalette
            />
          ),
        },
        {
          title: '是否默认',
          dataIndex: 'defFlag',
          width: '40%',
          align: 'center',
          render: status => (
            <TagOpt
              value={status}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              disablePalette
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: '新增',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleCreateModal();
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          icon: 'form',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleEditModal(selectedRows[0], true);
          },
        },
        // {
        //   key: 'remove',
        //   className: 'tw-btn-error',
        //   title: '删除',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 2,
        //   icon: 'delete',
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     dispatch({
        //       type: `${DOMAIN}/delete`,
        //       payload: { ids: selectedRowKeys, queryParams },
        //     });
        //   },
        // },
      ],
    };

    // console.log('formData ->', formData);

    return (
      <PageHeaderWrapper title="级别维护">
        <DataTable {...tableProps} />
        {/* -- modal -- */}
        <DetailModal
          visible={modalVisible}
          domain={DOMAIN}
          formData={formData}
          dataSource={dataSource}
          dispatch={dispatch}
          canEdit={canEdit}
          canEditDet={canEditDet}
          onToggle={this.cancelModal}
          onSubmit={this.submitModal}
          width={800}
          confirmLoading={confirmLoading}
        />
      </PageHeaderWrapper>
    );
  }
}

export default UserCapaLevel;
