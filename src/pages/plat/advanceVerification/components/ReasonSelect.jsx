import React from 'react';
import { isNil } from 'ramda';
import {
  getBuByReasonId,
  selectBuTask,
  selectContract,
  selectPreSaleTask,
  selectProject,
} from '@/services/user/expense/expense';
import SelectWithCols from '@/components/common/SelectWithCols';
import { Input, Spin } from 'antd';
import { UdcSelect } from '@/pages/gen/field';
import { createConfirm } from '@/components/core/Confirm';

const InputGroup = Input.Group;
// const DOMAIN = 'userExpenseNormalEdit';

const reasonSelectProps = {
  labelKey: 'name',
  valueKey: 'id',
  columns: [
    // { title: '编号', dataIndex: 'code', span: 4 },
    { title: '名称', dataIndex: 'name', span: 24 },
  ],
};

// 项目-项目号
// 售前/BU- 任务号
// 采购合同 - 采购合同号

// 项目 01
// 售前 02
// BU 03
// 采购合同 04

class ReasonSelect extends React.Component {
  // TODO
  // static getDerivedStateFromProps(nextProps, prevState) {
  //
  // }

  constructor(props) {
    super(props);
    this.state = {
      type: props.value[0],
      resId: props.resId,
      dataSource: [],
      loading: false,
    };
  }

  componentDidMount() {
    const { resId } = this.props;
    !isNil(resId) && this.fetchData(resId);
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    const { resId, type } = this.state;
    if (nextProps.resId !== resId) {
      !isNil(nextProps.resId) && this.fetchData(nextProps.resId);
      this.setState({
        resId: nextProps.resId,
      });
    }
    if (nextProps.value[0] !== type) {
      this.setState({
        type: nextProps.value[0],
      });
    }
  };

  update = value => {
    const { onChange } = this.props;
    const { type, dataSource } = this.state;
    getBuByReasonId(type, value.id).then(data => {
      const { expenseBuId, expenseBuName, expenseOuId, expenseOuName, sumBuId, sumBuName } =
        data.response.datum || {};
      const changeData = {
        reasonType: type,
        reasonId: value.id,
        reasonName: value.name,
        reasonCode: value.code,
        expenseBuId,
        expenseBuName,
        expenseOuId,
        expenseOuName,
        sumBuId,
        sumBuName,
      };
      if (type === '04') {
        const [
          projectList = [],
          preSaleTaskList = [],
          buTaskList = [],
          contractList = [],
        ] = dataSource;
        const { supplierId, subContractId } = contractList.find(
          contract => contract.code === value.code
        );
        changeData.supplierId = supplierId;
        changeData.subContractId = subContractId;
      }
      onChange && onChange(changeData);
    });
  };

  onChange = (value, selectedOptions) => {
    const { detailList } = this.props;
    detailList.length
      ? createConfirm({
          content: '修改事由会清空明细，是否继续？',
          onOk: () => {
            this.update(value);
          },
        })
      : this.update(value);
  };

  clear = value => {
    const { onChange } = this.props;
    onChange &&
      onChange({
        reasonType: value,
        reasonId: undefined,
        reasonName: undefined,
        reasonCode: undefined,
        expenseBuId: undefined,
        expenseBuName: undefined,
        expenseOuId: undefined,
        expenseOuName: undefined,
        sumBuId: undefined,
        sumBuName: undefined,
      });
    this.setState({
      type: value,
    });
  };

  onChangeType = value => {
    const { detailList } = this.props;
    detailList.length
      ? createConfirm({
          content: '修改事由会清空明细，是否继续？',
          onOk: () => {
            this.clear(value);
          },
        })
      : this.clear(value);
  };

  onSearch = value => {
    const { tmpl, type } = this.state;
    let reasonList = [];
    const [projectList = [], preSaleTaskList = [], buTaskList = [], contractList = []] = tmpl;

    switch (type) {
      case '01': {
        // 项目
        reasonList = projectList;
        break;
      }
      case '02': {
        // 售前任务
        reasonList = preSaleTaskList;
        break;
      }
      case '03': {
        // bu任务
        reasonList = buTaskList;
        break;
      }
      case '04': {
        // 合同
        reasonList = contractList;
        break;
      }
      default: {
        reasonList = [];
        break;
      }
    }

    const newReasonList = reasonList.filter(
      d => d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    );

    switch (type) {
      case '01': {
        this.setState({ dataSource: [newReasonList, preSaleTaskList, buTaskList, contractList] });
        break;
      }
      case '02': {
        this.setState({ dataSource: [projectList, newReasonList, buTaskList, contractList] });
        break;
      }
      case '03': {
        this.setState({ dataSource: [projectList, preSaleTaskList, newReasonList, contractList] });
        break;
      }
      case '04': {
        this.setState({ dataSource: [projectList, preSaleTaskList, buTaskList, newReasonList] });
        break;
      }
      default: {
        this.setState({ dataSource: [projectList, buTaskList, preSaleTaskList, contractList] });
        break;
      }
    }
  };

  fetchData(resId) {
    const p1 = selectProject(resId);
    const p2 = selectPreSaleTask(resId);
    const p3 = selectBuTask(resId);
    const p4 = selectContract(resId);
    this.setState({
      loading: true,
    });
    Promise.all([p1, p2, p3, p4]).then(values => {
      const dataSource = values.map(
        (result, index) =>
          // 数据清洗注释掉是因为，列表里面其他数据是要用的 :: -> this.update 里面， type === '04' 合同
          // result.response.map(item => ({
          //   name: item.name,
          //   code: item.code,
          //   id: item.id,
          // }))
          Array.isArray(result.response) ? result.response : []
      );
      this.setState({
        dataSource,
        tmpl: dataSource,
        loading: false,
      });
    });
  }

  render() {
    const { dataSource, loading, type, resId } = this.state;
    const { value, disabled, disableReasonType } = this.props; // [type, id, name]

    // console.log('value', value);
    // console.log('type', type);
    // console.log('resId', resId, loading);

    let reasonList = [];
    const [projectList = [], preSaleTaskList = [], buTaskList = [], contractList = []] = dataSource;
    switch (type) {
      case '01': {
        // 项目
        reasonList = projectList;
        break;
      }
      case '02': {
        // 售前任务
        reasonList = preSaleTaskList;
        break;
      }
      case '03': {
        // bu任务
        reasonList = buTaskList;
        break;
      }
      case '04': {
        // 合同
        reasonList = contractList;
        break;
      }
      default: {
        reasonList = [];
        break;
      }
    }
    // console.log(type, reasonList);

    return loading || resId === void 0 ? (
      <Spin size="small" />
    ) : (
      <InputGroup compact>
        <UdcSelect
          disabled={disabled || disableReasonType}
          value={type}
          onChange={this.onChangeType}
          allowClear={false}
          code="TSK:REASON_TYPE"
          className={null}
          style={{ width: '30%' }}
        />

        <SelectWithCols
          {...reasonSelectProps}
          value={{ id: value[1], name: value[2] }}
          onChange={this.onChange}
          dataSource={reasonList}
          selectProps={{
            disabled,
            dropdownMatchSelectWidth: false,
            showSearch: true,
            onSearch: this.onSearch,
            style: { width: '70%' },
          }}
        />
      </InputGroup>
    );
  }
}

export default ReasonSelect;
