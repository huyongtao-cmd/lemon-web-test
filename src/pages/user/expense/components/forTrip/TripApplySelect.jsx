import React from 'react';
import { isNil } from 'ramda';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectTripApply } from '@/services/user/expense/expense';
import Link from 'umi/link';

const resSelectProps = {
  labelKey: 'applyName',
  valueKey: 'id',
  columns: [
    { title: '申请号', dataIndex: 'applyNo', span: 10 },
    { title: '申请名', dataIndex: 'applyName', span: 14 },
    // { title: '网点', dataIndex: 'bankBranch', span: 4 },
  ],
};

class TripApplySelect extends React.Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    const { resId } = this.props;
    resId && this.fetchData(resId);
  }

  componentWillReceiveProps = (nextProps, nextContext) => {
    const { resId } = this.state;
    if (nextProps.resId !== resId) {
      this.fetchData(nextProps.resId);
      this.setState({
        resId: nextProps.resId,
      });
    }
  };

  fetchData = resId => {
    !isNil(resId) &&
      selectTripApply(resId).then(resp => {
        const { response = {} } = resp;
        const resList = Array.isArray(response.datum) ? response.datum : [];
        this.setState({
          resId,
          dataSource: resList.map(item => ({
            ...item,
            // id: item.id,
            // code: item.id,
          })),
        });
        const { value, initFeeCode } = this.props;
        // 编辑模式，根据出差申请单id，回写此单对应的费用码列表
        if (value) {
          const list = resList.filter((r = {}) => r.id + '' === value.id + '');
          if (list.length === 1) {
            initFeeCode(
              list[0].feeCodeList.map(l => ({
                ...l,
                id: l.feeCode,
                code: l.feeCode,
                name: l.feeCodeDesc,
              }))
            );
          }
        }
      });
  };

  onChange = (value, selectedOptions) => {
    const { onChange, initFeeCode } = this.props;
    initFeeCode(
      value
        ? (value.feeCodeList || []).map(l => ({
            ...l,
            id: l.feeCode,
            code: l.feeCode,
            name: l.feeCodeDesc,
          }))
        : []
    );
    onChange && onChange(value);
  };

  render() {
    const { dataSource } = this.state;
    const { value, disabled } = this.props;
    // console.log(value);
    /**
     * 新需求：
     * 差旅的详情页，要求出差申请但变成超链接，能跳转到出差申请单明细。
     * 即： disabled === true 的时候，这里变成超链接
     */
    if (disabled)
      return (
        <Link className="tw-link" to={`/user/center/travel/detail?id=${(value || {}).id}`}>
          {(value || {}).applyName}
        </Link>
      );
    return (
      <SelectWithCols
        {...resSelectProps}
        value={value}
        onChange={this.onChange}
        dataSource={dataSource}
        selectProps={{
          style: { width: '100%' },
          allowClear: true,
          disabled,
        }}
      />
    );
  }
}

export default TripApplySelect;
