import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Modal, Row, Col, Input, Button, Card, Divider, Tag, Popover } from 'antd';
import { Selection, DatePicker } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';
import router from 'umi/router';
import {
  templateResPlanningListUri,
  templateResPlanningDetailUri,
} from '@/services/user/project/project';
import { clone } from 'ramda';
import moment from 'moment';

const { Description } = DescriptionList;

// 处理空属性,可以处理list,{},字符串
const handleEmptyProps = param => {
  if (param === undefined || param === null) {
    return undefined;
  }
  if (typeof param === 'object') {
    let newObject;
    if (Array.isArray(param)) {
      newObject = Object.assign([], param);
      for (let index = 0; index < newObject.length; index += 1) {
        const val = param[index];
        if (val === undefined || val === null) {
          newObject.splice(index, 1);
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[index] = val.trim();
          } else {
            newObject.splice(index, 1);
          }
        }
      }
    } else {
      // 是一个对象
      newObject = Object.assign({}, param);
      Object.keys(newObject).forEach(key => {
        const val = param[key];
        if (val === undefined || val === null) {
          delete newObject[key];
          return;
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[key] = val.trim();
          } else {
            delete newObject[key];
          }
        }
      });
    }
    return newObject;
  }
  if (typeof param === 'string') {
    return param.trim();
  }
  return param;
};

// 动态列属性初始化
const columnTempl = {
  title: 'W',
  dataIndex: 'yearWeek_',
  align: 'center',
  width: 50,
  render: '',
};
// 动态列数组初始化
let extraCols = [];

@connect(({ loading, dispatch }) => ({
  loading,
  dispatch,
}))
class TemplateImportModal extends React.Component {
  state = {
    columnNum: 0,
    businessTmplList: [],
    total: 0,
    selectedKey: undefined,
    businessTmplDetail: {},
  };

  componentDidMount() {
    this.fetchData({});
  }

  fetchData = params => {
    const that = this;
    templateResPlanningListUri({ ...handleEmptyProps(params), personalFlag: true }).then(data => {
      const { response } = data;
      that.setState({
        businessTmplList: clone(Array.isArray(response.rows) ? response.rows : []),
        total: response.total,
        selectedKey: undefined,
      });
    });
  };

  fetchBusinessTmplDetail = () => {
    const { selectedKey } = this.state;
    templateResPlanningDetailUri({ id: selectedKey }).then(data => {
      this.setState({ businessTmplDetail: data.response.datum });
      const { planningTitle: formData } = data.response.datum;
      const temp = [];
      if (formData.durationWeek) {
        for (let index = 0; index < parseInt(formData.durationWeek, 10); index += 1) {
          // const dataIndex = columnTempl.dataIndex + index;
          const styles = {
            cursor: 'pointer',
          };
          temp.push({
            ...columnTempl,
            title: (
              <Popover
                content={`${moment(formData.startDate)
                  .add(index, 'weeks')
                  .format('YYYY-MM-DD')}~${moment(formData.startDate)
                  .add(index, 'weeks')
                  .add(6, 'days')
                  .format('YYYY-MM-DD')}`}
                trigger="hover"
              >
                <span style={styles}>
                  {index === 0 ? columnTempl.title : columnTempl.title + index}
                </span>
              </Popover>
            ),
            dataIndex: columnTempl.dataIndex + index,
            width: 50,
            // eslint-disable-next-line no-loop-func
          });
        }
      }
      extraCols = temp;
      this.setState({
        columnNum: parseInt(formData.durationWeek, 10),
      });
    });
  };

  onRowChange = (selectedRowKeys, selectedRows) => {
    const id = selectedRowKeys[0];
    this.setState({ selectedKey: id }, () => {
      this.fetchBusinessTmplDetail();
    });
  };

  handleOnRow = record => {
    // eslint-disable-next-line no-shadow
    const { businessTmplDetail } = this.state;
    const { id } = record;
    return {
      // 点击行
      onClick: event => {
        this.onRowChange([id]);
      },
      onDoubleClick: event => {
        const { onCheck } = this.props;
        onCheck(businessTmplDetail);
      },
    };
  };

  tableCfg = () => {
    const { businessTmplList, total, selectedKey } = this.state;
    const tableProps = {
      rowKey: 'id',
      bordered: true,
      sortDirection: 'DESC',
      dataSource: businessTmplList,
      total,
      showColumn: false,
      showExport: false,
      showSearch: true,
      // onSearchBarChange: (changedValues, allValues) => {
      //   this.setState({searchForm:allValues});
      // },
      onChange: filters => this.fetchData(filters),
      onRow: this.handleOnRow,
      rowSelection: {
        type: 'radio',
        selectedRowKeys: [selectedKey],
        onChange: this.onRowChange,
      },
      searchBarForm: [
        {
          title: '名称',
          dataIndex: 'tmplName',
          colProps: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 },
          tag: <Input placeholder="请输入名称" />,
        },
        {
          title: '权限类型',
          dataIndex: 'permissionType',
          colProps: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 },
          tag: <Selection.UDC code="TSK:TASK_TMPL_PERMISSION_TYPE" placeholder="请选择权限类型" />,
        },
      ],
      columns: [
        {
          title: '名称',
          dataIndex: 'tmplName',
        },
        {
          title: '创建人',
          dataIndex: 'createResName',
        },
        {
          title: '权限类型',
          dataIndex: 'permissionTypeDesc',
        },
        // {
        //   title: '适用事由类型',
        //   dataIndex: 'reasonTypeDesc',
        // },
      ],
      leftButtons: [
        {
          key: 'maintenance',
          className: 'tw-btn-primary',
          title: '维护模板',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/user/Project/templates');
          },
        },
      ],
    };
    return tableProps;
  };

  actTableCfg = () => {
    // eslint-disable-next-line no-shadow
    const { businessTmplDetail, columnNum } = this.state;
    const dataSource = businessTmplDetail.details || [];
    return {
      rowKey: 'id',
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      scroll: { x: 1000 + columnNum * 50 },
      columns: [
        {
          title: '角色',
          dataIndex: 'role',
          align: 'center',
        },
        {
          title: '资源',
          dataIndex: 'resName',
          align: 'center',
        },
        {
          title: '复合能力（系数）',
          dataIndex: 'capasetLevelDesc',
          align: 'center',
        },
        {
          title: '系数',
          dataIndex: 'distributeRate',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '开始日期',
          dataIndex: 'startDate',
          align: 'center',
        },
        {
          title: '结束日期',
          dataIndex: 'endDate',
          align: 'center',
        },
        {
          title: '总人天',
          dataIndex: 'totalDays',
          align: 'center',
        },
        {
          title: '总当量',
          dataIndex: 'totalEqva',
          align: 'center',
        },
        ...extraCols,
      ],
    };
  };

  render() {
    const { visible, templateImportModal } = this.props;

    // eslint-disable-next-line no-shadow
    let formData = {};
    const { businessTmplDetail } = this.state;
    if (businessTmplDetail) {
      formData = businessTmplDetail.planningTitle;
    }
    const tableProps = this.tableCfg();
    const actTableProps = this.actTableCfg();

    return (
      <Modal
        title="选择模版"
        visible={visible}
        onOk={this.onSelectTmp}
        onCancel={templateImportModal}
        width="80%"
        footer={null}
      >
        <Row>
          <Col span={8}>
            <DataTable {...tableProps} />
          </Col>
          <Col offset={1} span={15}>
            <Card
              title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
              bordered={false}
              className="tw-card-adjust"
            >
              <DescriptionList size="large" col={2} hasSeparator>
                <Description term="名称">{formData ? formData.tmplName : ''}</Description>
                <Description term="创建人">{formData ? formData.createResName : ''}</Description>
                <Description term="权限类型 ">
                  {formData ? formData.permissionTypeDesc : ''}
                </Description>
                <Description term="持续周数">{formData ? formData.durationWeek : ''}</Description>
              </DescriptionList>
            </Card>
            <br />
            <Card title="模板详情" bordered={false} className="tw-card-adjust">
              <DataTable {...actTableProps} />
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default TemplateImportModal;
