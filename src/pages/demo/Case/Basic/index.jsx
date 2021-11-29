import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Form,
  Icon,
  Input,
  Radio,
  Row,
  Select,
  Table,
} from 'antd';

import { injectUdc, mountToTab } from '@/layouts/routerControl';
import { HintHelper } from '@/pages/gen/hint';
import AsyncSelect from '@/components/common/AsyncSelect';
import SyntheticField from '@/components/common/SyntheticField';
import Title from '@/components/layout/Title';
import { createAlert, createConfirm } from '@/components/core/Confirm';
import { createNotify } from '@/components/core/Notify';
import DescriptionList from '@/components/layout/DescriptionList';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import PrintHelper from '@/components/common/PrintHelper';
import FlowButton from '@/components/common/FlowButton';

import { MonthRangePicker, UdcCheck, UdcSelect } from '@/pages/gen/field';
import { selectUsers } from '@/services/sys/user';

import ModalDemo from './ModalDemo'; // eslint-disable-line
import TabDemo from './TabDemo'; // eslint-disable-line
import DegenTable from './DegenTable'; // eslint-disable-line
import TreeTable from './TreeTable'; // eslint-disable-line

// const FormItem = Form.Item;
// const { TextArea } = Input;
const { Description } = DescriptionList;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'fiddle';
const operationTabList = [
  {
    key: 'tab1',
    tab: '基本信息',
  },
  {
    key: 'tab2',
    tab: '联系信息',
  },
  {
    key: 'tab3',
    tab: '教育背景',
  },
];

const fieldLabels = {
  name: '仓库名',
  url: '仓库域名',
  owner: '仓库管理员',
  approver: '审批人',
  dateRange: '生效日期',
  udcTest: '测试UDC下拉',
  customSelect: '负责人下拉',
  checkbox: '选择框测试',
  popup: '弹出窗测试',
  textArea: '大型输入',
  multiSel: '多项输入',
  static: '模块描述',
  province: '请选择省',
  city: '请选择市',
  month: '月度区间查询',
};

const provinceData = ['Zhejiang', 'Jiangsu'];
const cityData = {
  Zhejiang: ['Hangzhou', 'Ningbo', 'Wenzhou'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
};

// 假数据demo表格配置
const columns = [
  { title: '业务员', width: 100, dataIndex: 'sales', key: 'sales', fixed: 'left' },
  { title: '总年销量', width: 100, dataIndex: 'total', key: 'total', fixed: 'left' },
  { title: '总销售额', width: 100, dataIndex: 'income', key: 'income', fixed: 'left' },
  {
    title: '全年销售额',
    fixed: 'top',
    children: [
      {
        title: '第一季度',
        fixed: 'top',
        children: [
          { title: '一月份', dataIndex: 'jan', key: '1' },
          { title: '二月份', dataIndex: 'feb', key: '2' },
          { title: '三月份', dataIndex: 'mar', key: '3' },
        ],
      },
      {
        title: '第二季度',
        fixed: 'top',
        children: [
          { title: '四月份', dataIndex: 'apr', key: '4' },
          { title: '五月份', dataIndex: 'may', key: '5' },
          { title: '六月份', dataIndex: 'jun', key: '6' },
        ],
      },
      {
        title: '第三季度',
        fixed: 'top',
        children: [
          { title: '七月份', dataIndex: 'jul', key: '7' },
          { title: '八月份', dataIndex: 'aug', key: '8' },
          { title: '九月份', dataIndex: 'sep', key: '9' },
        ],
      },
      {
        title: '第四季度',
        fixed: 'top',
        children: [
          { title: '十月份', dataIndex: 'oct', key: '10' },
          { title: '十一月份', dataIndex: 'nov', key: '11' },
          { title: '十二月份', dataIndex: 'dec', key: '12' },
        ],
      },
    ],
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 100,
    render: () => <a>操作</a>, // 在这里放组件
  },
];

const tableData = [
  {
    key: '1',
    sales: 'John Brown',
    total: 100000,
    income: 32,
    jan: '87954.21',
    feb: '87954.21',
    mar: '87954.21',
    apr: '87954.21',
    may: '87954.21',
    jun: '87954.21',
    jul: '87954.21',
    aug: '87954.21',
    sep: '87954.21',
    oct: '87954.21',
    nov: '87954.21',
    dec: '87954.21',
  },
  {
    key: '2',
    sales: 'John Brown',
    total: 100000,
    income: 40,
    jan: '87954.21',
    feb: '87954.21',
    mar: '87954.21',
    apr: '87954.21',
    may: '87954.21',
    jun: '87954.21',
    jul: '87954.21',
    aug: '87954.21',
    sep: '87954.21',
    oct: '87954.21',
    nov: '87954.21',
    dec: '87954.21',
  },
];
// 弹出框树形假数据
const items = [
  {
    title: '资源大平台',
    key: '1',
    children: [
      {
        title: '管理部',
        key: '2',
        children: [
          {
            title: '总裁办',
            key: '3',
          },
          {
            title: '市场部',
            key: '4',
          },
        ],
      },
      {
        title: '资源管理部',
        key: '5',
      },
      {
        title: '产品研发部',
        key: '6',
      },
    ],
  },
];

// 流程参数 模板页面直接写了参数值 项目里用到参数值请自定义

const commitprops = {
  defkey: 'ACC_A05',
  value: {
    id: 1,
    data: {
      name: '测试流程通过',
      num: 10,
      isFlow: true,
    },
  },
};
const passProps = {
  taskId: 'TSK_S04:1:8bbf2155-1eba-11e9-89c0-000c2992c5f8',
  result: 'APPROVED',
};
const returnProps = {
  taskId: 'TSK_S04:1:8bbf2155-1eba-11e9-89c0-000c2992c5f8',
  result: 'REJECTED',
};

const showButton = {
  COMMIT: true,
  PASS: true,
  RETURN: true,
  COUNTERSIGN: false,
  NOTICE: true,
  NOTIFY: false,
};
const moreButtonFn = () => {
  // moreButton TODO
};
const moreButton = (
  <Button key="moreButton" className="tw-btn-primary" size="large" onClick={() => moreButtonFn}>
    更多按钮
  </Button>
);

// 开发请从这里复制你想要的功能当作模版 (TODO: 尚未开发完成)
@connect(({ loading, fiddle, global }) => ({
  loading,
  ...fiddle,
  showHelp: global.showHelp,
  // loading: loading.effects['flow/fetchAdvanced'],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@injectUdc(
  {
    accType: 'COM.GENDER',
    accType_1: 'COM.ACCOUNT_TYPE1',
    accType_2: 'COM.ACCOUNT_TYPE2',
  },
  DOMAIN
)
@mountToTab()
class BasicTemplate extends PureComponent {
  state = {
    modalVisible: false,
    operationkey: 'tab1',
    cities: cityData[provinceData[0]],
    secondCity: cityData[provinceData[0]][0],
    allowCheckbox: false,
    carMap: [
      {
        code: 'A1',
        name: '保时捷',
      },
      {
        code: 'A2',
        name: '法拉利',
      },
      {
        code: 'A3',
        name: '奔驰',
      },
      {
        code: 'A4',
        name: '兰博基尼',
      },
      {
        code: 'A5',
        name: '玛莎拉蒂',
      },
      {
        code: 'A6',
        name: '本田',
      },
      {
        code: 'A7',
        name: '雷诺',
      },
      {
        code: 'A8',
        name: '柯尼赛格',
      },
      {
        code: 'A9',
        name: '奥迪',
      },
      {
        code: 'A0',
        name: '宝马',
      },
    ],
  };

  componentDidMount() {
    // const { dispatch } = this.props;
    // eslint-disable-next-line
    console.log('[EL-DEMO]: 正常加载数据');
  }

  changeField = (value, fieldName) => {
    const { dispatch } = this.props;
    // console.log('stat change ->', value);
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [fieldName]: value },
    });
  };

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  modalOk = (e, selectValue) => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
      selectValue,
    });
  };

  modalCancel = e => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  toggleModal = e => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  };

  handleChange = value => {
    // eslint-disable-next-line
    console.log(`selected ${value}`);
  };

  tryConfirm = () =>
    createConfirm({
      content: '这里发生了一个弹窗，点击按钮选择操作(此处不会生效)。',
      onOk: () => createNotify({ code: 'ng.test' }),
    });

  tryAlert = () => {
    createAlert.success({
      content: '这里发生了一个弹窗，点击按钮选择操作(此处不会生效)。',
      onOk: () => console.log('AA-AA'), // eslint-disable-line
    });
  };

  tryPopup = () => createNotify({ title: 'misc.hint', code: 'NG_TEST', type: 'error' });

  onChangeBtnClick = () => {};

  handleProvinceChange = value => {
    this.setState({
      cities: cityData[value],
      secondCity: cityData[value][0],
    });
  };

  onSecondCityChange = value => {
    this.setState({
      secondCity: value,
    });
  };

  render() {
    const {
      dispatch,
      formData,
      form: { getFieldDecorator },
    } = this.props;

    const { _udcMap } = this.state;
    // eslint-disable-next-line
    console.log('_udcMap ->', _udcMap);

    const {
      allowCheckbox,
      operationkey,
      modalVisible,
      cities,
      carMap,
      secondCity,
      selectValue,
    } = this.state;

    const contentList = {
      tab1: (
        <>
          <DescriptionList size="large" title="卡片信息" col={2} hasSeparator>
            <Description term="姓名">李先生</Description>
            <Description term="工号">893456</Description>
            <Description term="性别">男</Description>
            <Description term="出生日期">1994-04-21</Description>
            <Description term="证件类型">身份证</Description>
            <Description term="国籍">中国</Description>
            <Description term="证件号码">410123000000002312</Description>
            <Description term="证件有效期">2017-07-07 ~ 2017-08-08</Description>
          </DescriptionList>
          <DescriptionList size="large" title="卡片信息" col={2}>
            <Description term="姓名">李先生</Description>
            <Description term="工号">893456</Description>
            <Description term="性别">男</Description>
            <Description term="出生日期">1994-04-21</Description>
            <Description term="证件类型">身份证</Description>
            <Description term="国籍">中国</Description>
            <Description term="证件号码">410123000000002312</Description>
            <Description term="证件有效期">2017-07-07 ~ 2017-08-08</Description>
          </DescriptionList>
        </>
      ),
      tab2: <TabDemo dispatch={dispatch} onChangeBtnClick={this.onChangeBtnClick} />,
      tab3: (
        <Card className="tw-card-adjust" title="教育背景" bordered={false}>
          教育背景
        </Card>
      ),
    };

    return (
      <PageHeaderWrapper title="基础组件参考">
        <Card className="tw-card-adjust" bordered={false}>
          <Row gutter={16}>
            <Col lg={8} md={24}>
              <Link to="/demo/dashboard/workplace">
                点我跳转到报表页面工作台 <Icon type="star" />
              </Link>
            </Col>
            <Col lg={8} md={24}>
              <a onClick={this.toggleModal}>弹出窗等操作，请大力戳我</a>
            </Col>
          </Row>
          <Row className="m-b-2" gutter={16}>
            <Col lg={8} md={24}>
              <a onClick={this.tryAlert}>弹出alert</a>
            </Col>
            <Col lg={8} md={24}>
              <a onClick={this.tryConfirm}>弹出confirm</a>
            </Col>
            <Col lg={8} md={24}>
              <a onClick={this.tryPopup}>弹出popup</a>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={24} md={24}>
              <HintHelper placement="topLeft" content="这个按钮用来保存">
                <Button type="primary" icon="save" size="large" onClick={this.tryPopup}>
                  保存
                </Button>
              </HintHelper>
              <HintHelper
                placement="topLeft"
                content="注意，Checkbox的返回值是数组(谁看到这句话了？哦，终于有人看了，谢天谢地。。。)"
              >
                <Button
                  className="m-l-1"
                  type="danger"
                  icon="deployment-unit"
                  size="large"
                  onClick={() => this.setState({ allowCheckbox: !allowCheckbox })}
                >
                  切换
                </Button>
              </HintHelper>
              <PrintHelper content={() => this.componentRef}>
                <Button className="m-l-1" type="dashed" icon="printer" size="large">
                  打印
                </Button>
              </PrintHelper>
            </Col>
          </Row>
        </Card>
        <br />
        <Card className="tw-card-rightLine" title="流程测试按钮">
          <FlowButton
            commitprops={commitprops}
            passProps={passProps}
            returnProps={returnProps}
            showButton={showButton}
            moreButton={moreButton}
          />
        </Card>

        {/** buttons */}
        <Card className="tw-card-rightLine" title="咱们项目常规尺寸">
          <Button className="tw-btn-default" size="large" icon="undo">
            返回
          </Button>
          <Button className="tw-btn-default" size="large">
            返回
          </Button>
          <Button className="tw-btn-primary" size="large" icon="search">
            搜索
          </Button>
          <Button className="tw-btn-primary" size="large">
            搜索
          </Button>
          <Button className="tw-btn-info" size="large" icon="plus-circle">
            新增
          </Button>
          <Button className="tw-btn-info" size="large">
            新增
          </Button>
          <Button className="tw-btn-success" size="large" icon="tag">
            活动
          </Button>
          <Button className="tw-btn-success" size="large">
            活动
          </Button>
          <Button className="tw-btn-error" size="large" icon="file-excel">
            删除
          </Button>
          <Button className="tw-btn-error" size="large">
            删除
          </Button>
          <Button className="tw-btn-warning" size="large" icon="warning">
            警告
          </Button>
          <Button className="tw-btn-warning" size="large">
            警告
          </Button>
          <Button className="separate" size="large" icon="upload" />
        </Card>
        <br />

        <Card className="tw-card-rightLine" title="常规尺寸小一号">
          <Button className="tw-btn-default" icon="undo">
            返回
          </Button>
          <Button className="tw-btn-default">返回</Button>
          <Button className="tw-btn-primary" icon="search">
            搜索
          </Button>
          <Button className="tw-btn-primary">搜索</Button>
          <Button className="tw-btn-info" icon="plus-circle">
            新增
          </Button>
          <Button className="tw-btn-info">新增</Button>
          <Button className="tw-btn-success" icon="tag">
            活动
          </Button>
          <Button className="tw-btn-success">活动</Button>
          <Button className="tw-btn-error" icon="file-excel">
            删除
          </Button>
          <Button className="tw-btn-error">删除</Button>
          <Button className="tw-btn-warning" icon="warning">
            警告
          </Button>
          <Button className="tw-btn-warning">警告</Button>
          <Button icon="upload" />
        </Card>
        <br />

        <Card className="tw-card-rightLine" title="常规尺寸再小一号">
          <Button className="tw-btn-default" size="small" icon="undo">
            返回
          </Button>
          <Button className="tw-btn-default" size="small">
            返回
          </Button>
          <Button className="tw-btn-primary" size="small" icon="search">
            搜索
          </Button>
          <Button className="tw-btn-primary" size="small">
            搜索
          </Button>
          <Button className="tw-btn-info" size="small" icon="plus-circle">
            新增
          </Button>
          <Button className="tw-btn-info" size="small">
            新增
          </Button>
          <Button className="tw-btn-success" size="small" icon="tag">
            活动
          </Button>
          <Button className="tw-btn-success" size="small">
            活动
          </Button>
          <Button className="tw-btn-error" size="small" icon="file-excel">
            删除
          </Button>
          <Button className="tw-btn-error" size="small">
            删除
          </Button>
          <Button className="tw-btn-warning" size="small" icon="warning">
            警告
          </Button>
          <Button className="tw-btn-warning" size="small">
            警告
          </Button>
          <Button size="small" icon="upload" />
        </Card>
        <br />

        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="app.settings.menuMap.basic" defaultMessage="明细卡片" />}
          bordered={false}
        >
          <FieldList
            layout="horizontal"
            legend="基础组件"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator
          >
            <FieldLine
              label="三个"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 20, xxl: 20 }}
            >
              <Field
                name="a"
                decorator={{
                  initialValue: formData.a,
                  rules: [{ required: true, message: '请输入' + fieldLabels.name }],
                }}
                wrapperCol={{ span: 20, xxl: 23 }}
              >
                <Input placeholder="a" />
              </Field>
              <Field
                name="b"
                decorator={{
                  initialValue: formData.b,
                  rules: [{ required: true, message: '请输入' + fieldLabels.name }],
                }}
                wrapperCol={{ span: 20, xxl: 23 }}
              >
                <Input placeholder="b" />
              </Field>
              <Field
                name="c"
                decorator={{
                  initialValue: formData.c,
                  rules: [{ required: true, message: '请输入' + fieldLabels.name }],
                }}
                wrapperCol={{ span: 20, xxl: 23 }}
              >
                <Input placeholder="c" />
              </Field>
            </FieldLine>
            <FieldLine label="两个">
              <Field
                name="x"
                decorator={{
                  initialValue: formData.x,
                  rules: [{ required: true, message: '请输入' + fieldLabels.name }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input placeholder="x" />
              </Field>
              <Field
                name="y"
                decorator={{
                  initialValue: formData.y,
                  rules: [{ required: true, message: '请输入' + fieldLabels.name }],
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input placeholder="y" />
              </Field>
            </FieldLine>
            <Field
              name="name"
              label={
                <HintHelper placement="topLeft" content="这个字段是用来输入的(好像根没说一样)。">
                  {fieldLabels.name}
                </HintHelper>
              }
              decorator={{
                initialValue: formData.name,
                rules: [{ required: true, message: '请输入' + fieldLabels.name }],
              }}
            >
              <Input placeholder="请输入仓库名称" />
            </Field>
            <Field
              name="url"
              label={fieldLabels.url}
              decorator={{
                initialValue: formData.url,
                rules: [{ required: true, message: '请输入' + fieldLabels.url }],
              }}
            >
              <Input
                className="x-fill-100"
                addonBefore="http://"
                addonAfter=".com"
                placeholder="请输入"
              />
            </Field>
            <Field
              name="owner"
              label={fieldLabels.owner}
              decorator={{
                initialValue: formData.owner,
                rules: [{ required: true, message: '请选择' + fieldLabels.owner }],
              }}
            >
              <Select placeholder="请选择管理员" showSearch>
                <Select.Option value="xiao">付晓晓</Select.Option>
                <Select.Option value="mao">周毛毛</Select.Option>
              </Select>
            </Field>

            <Field
              name="range"
              label="输入范围"
              decorator={{
                initialValue: formData.range || [],
                rules: [{ required: true, message: '请选择输入范围' }],
              }}
            >
              <SyntheticField className="tw-field-group">
                <Radio.Group className="tw-field-group-filter" buttonStyle="solid">
                  <Radio.Button value="eq">=</Radio.Button>
                  <Radio.Button value="ne">≠</Radio.Button>
                </Radio.Group>
                <Select className="tw-field-group-field" placeholder="请选择管理员" showSearch>
                  <Select.Option value="xiao">付晓晓</Select.Option>
                  <Select.Option value="mao">周毛毛</Select.Option>
                </Select>
              </SyntheticField>
            </Field>

            <Field
              name="approver"
              label={fieldLabels.approver}
              decorator={{
                initialValue: formData.approver,
                rules: [{ required: true, message: '请选择' + fieldLabels.approver }],
              }}
              data-id="mao"
            >
              <Input
                addonAfter={
                  <Select style={{ width: 120 }} placeholder="请选择审批员">
                    <Select.Option value="xiao">付晓晓</Select.Option>
                    <Select.Option value="mao">周毛毛</Select.Option>
                  </Select>
                }
              />
            </Field>
            <Field
              name="dateRange"
              label={fieldLabels.dateRange}
              decorator={{
                initialValue: formData.dateRange,
                rules: [{ required: true, message: '请选择' + fieldLabels.dateRange }],
              }}
            >
              <DatePicker.RangePicker
                placeholder={['开始日期', '结束日期']}
                className="x-fill-100"
              />
            </Field>
            <Field
              name="udcTest"
              label={fieldLabels.udcTest}
              decorator={{
                initialValue: formData.udcTest,
                rules: [{ required: true, message: '请选择' + fieldLabels.udcTest }],
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '这个是异步的！如果没有刷新，注意一下缓存。',
              }}
            >
              <UdcSelect code="COM.YESNO" placeholder="测试UDC下拉" />
            </Field>
            <Field
              name="customCheckbox"
              label={fieldLabels.checkbox}
              decorator={{
                initialValue: '0',
                rules: [{ required: true, message: '请选择勾选至少1条记录' }],
              }}
            >
              <UdcCheck multiple={allowCheckbox} code="COM.GENDER" placeholder="性别" />
            </Field>
            <Field
              name="customSelect"
              label={fieldLabels.customSelect}
              decorator={{
                initialValue: formData.customSelect,
                rules: [{ required: true, message: '请选择' + fieldLabels.customSelect }],
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '这个是异步的！如果没有刷新，注意一下缓存。',
              }}
            >
              <AsyncSelect
                source={() => selectUsers().then(resp => resp.response)}
                placeholder="负责人下拉"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
            <Field
              name="popup"
              label={fieldLabels.popup}
              prefix={<Icon type="user" />}
              decorator={{
                initialValue: selectValue ? selectValue.title : '',
                rules: [{ required: true, message: '请输入' + fieldLabels.popup }],
              }}
            >
              <Input
                addonAfter={
                  <a className="tw-link" onClick={this.toggleModal}>
                    <Icon type="search" />
                  </a>
                }
              />
            </Field>

            <Field label={fieldLabels.static} presentational>
              <span>纯静态字符串。</span>
            </Field>

            <Field
              name="multiSel"
              label={fieldLabels.multiSel}
              decorator={{
                initialValue: ['A2', 'A3'],
                rules: [{ required: true, message: '请输入' + fieldLabels.multiSel }],
              }}
            >
              <Select
                mode="multiple"
                className="x-fill-100"
                placeholder="请选择想购买的车"
                onChange={this.handleChange}
              >
                {carMap.map(item => (
                  <Select.Option key={item.code}>{item.name}</Select.Option>
                ))}
              </Select>
            </Field>

            <Field
              name="month"
              label={fieldLabels.month}
              decorator={{
                initialValue: formData.month,
              }}
            >
              <MonthRangePicker />
            </Field>

            <Field
              name="textArea"
              label={fieldLabels.textArea}
              decorator={{
                rules: [{ required: false }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="Autosize height with minimum and maximum number of lines"
                rows={3}
              />
            </Field>
          </FieldList>
        </Card>
        <br />

        <Card
          className="tw-card-adjust"
          title={
            <>
              <Title icon="profile" id="app.settings.menuMap.basic" defaultMessage="明细卡片" />
              <small className="m-l-4">
                - 注意: 如果你的页面有编辑功能，建议使用上方表单组件来
              </small>
            </>
          }
          bordered={false}
        >
          <DescriptionList size="large" title="详情模块" col={2} hasSeparator>
            <Description term="我是一个长字段">
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
            <Description term="是一个长字段">
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
            <Description term="一个长字段">
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
            <Description term="个长字段">
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
            <Description term="长字段">
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
          </DescriptionList>

          <DescriptionList size="large" title="退款申请" col={2}>
            <Description
              term="我是一个长字段"
              popover={{
                content: '我的内容太长放不下啊～',
              }}
            >
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
            <Description
              term={<FormattedMessage id="dev.demo.card.detail.title" defaultMessage="基础设置" />}
            >
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
            <Description
              term={<FormattedMessage id="dev.demo.card.detail.title" defaultMessage="基础设置" />}
            >
              {getFieldDecorator('name_1', {
                rules: [{ required: true, message: '请输入仓库名称' }],
              })(<Input size="small" className="x-fill-100" placeholder="请输入仓库名称" />)}
            </Description>
            <Description term="个长字段">
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
            </Description>
            <Description term="一个长字段">
              在那遥远的地方有位好姑娘人们走过了她的毡房都要回头留恋地张望
              我愿做一只小羊跟在她身旁我愿她拿着细细的皮鞭不断轻轻打在我身上
              我愿她拿着细细的皮鞭不断轻轻打在我身上 我愿她拿着细细的皮鞭不断轻轻打在我身上
            </Description>
          </DescriptionList>
        </Card>
        <br />

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title
              icon="profile"
              id="ui.menu.demo.card.multisel"
              defaultMessage="卡片标题 - 可以带一个图标，其他地方也可以用"
            />
          }
        >
          <FieldList
            layout="horizontal"
            legend="基础组件"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="province"
              label={fieldLabels.province}
              decorator={{
                initialValue: provinceData[0],
                rules: [{ required: true, message: '请输入' + fieldLabels.province }],
              }}
            >
              <Select style={{ width: 120 }} onChange={this.handleProvinceChange}>
                {provinceData.map(province => (
                  <Select.Option key={province}>{province}</Select.Option>
                ))}
              </Select>
            </Field>
            <Field
              name="city"
              label={fieldLabels.city}
              decorator={{
                initialValue: secondCity,
                rules: [{ required: true, message: '请输入' + fieldLabels.city }],
              }}
              value={secondCity}
            >
              <Select style={{ width: 120 }} onChange={this.onSecondCityChange}>
                {cities.map(city => (
                  <Select.Option key={city}>{city}</Select.Option>
                ))}
              </Select>
            </Field>
          </FieldList>
        </Card>
        <br />

        <Card className="tw-card-adjust" title="任意卡片+标题" bordered={false}>
          <div className="tw-card-title">我是一个单独的标题</div>
        </Card>
        <br />

        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={operationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
        <br />

        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="dev.demo.card.detail.title" defaultMessage="收缩卡片" />}
          bordered={false}
        >
          <Collapse
            defaultActiveKey={['1']}
            onChange={() => {
              // eslint-disable-next-line
              console.log('!!-- changed --!!');
            }}
          >
            <Collapse.Panel header="在那遥远的地方有位好姑娘" key="1">
              <p>在那遥远的地方有位好姑娘</p>
            </Collapse.Panel>
            <Collapse.Panel header="人们走过了她的毡房都要回头留恋地张望" key="2">
              <p>人们走过了她的毡房都要回头留恋地张望</p>
            </Collapse.Panel>
            <Collapse.Panel header="我愿做一只小羊跟在她身旁" key="3">
              <p>我愿做一只小羊跟在她身旁</p>
            </Collapse.Panel>
            <Collapse.Panel header="我愿她拿着细细的皮鞭不断轻轻打在我身上" key="4">
              <p>我愿她拿着细细的皮鞭不断轻轻打在我身上</p>
            </Collapse.Panel>
          </Collapse>
        </Card>
        <br />

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="ui.menu.demo.table" defaultMessage="表格 - 跨行 锁列等" />
          }
        >
          <Table columns={columns} dataSource={tableData} scroll={{ x: 1600 }} />
        </Card>
        <br />

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="ui.menu.demo.table" defaultMessage="表格 - 跨行 锁列等" />
          }
        >
          <div
            ref={el => {
              this.componentRef = el;
            }}
          >
            <DegenTable />
          </div>
        </Card>
        <br />

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="ui.menu.demo.table" defaultMessage="表格 - 跨行 锁列等" />
          }
        >
          <TreeTable />
        </Card>
        <br />

        <ModalDemo
          visible={modalVisible}
          handleOk={this.modalOk}
          handleCancel={this.modalCancel}
          items={items}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BasicTemplate;
