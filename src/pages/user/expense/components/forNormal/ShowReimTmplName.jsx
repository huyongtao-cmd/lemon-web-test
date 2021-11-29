import React from 'react';
import { selectUsersWithBu } from '@/services/gen/list';
import { getReimTmpl } from '@/services/user/expense/expense';
import { Spin } from 'antd';

class ShowReimTmplName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: {},
      reimType1: props.value.reimType1,
      reimType2: props.value.reimType2,
      reimType3: props.value.reimType3,
      expenseOuId: props.value.expenseOuId,
      loading: false,
    };
  }

  fetchData = (reimType1, reimType2, reimType3, expenseOuId) => {
    this.setState({
      loading: true,
    });
    getReimTmpl({
      reimType1,
      reimType2,
      reimType3,
      legalOuId: expenseOuId,
    }).then(res => {
      // console.log(res);
      this.setState({
        value: res.response.datum,
        loading: false,
      });
    });
  };

  // componentDidMount() {}

  componentWillReceiveProps = (nextProps, nextContext) => {
    const { reimType1, reimType2, reimType3, expenseOuId } = this.state;

    const vReimType1 = nextProps.value.reimType1;
    const vRreimType2 = nextProps.value.reimType2;
    const vRreimType3 = nextProps.value.reimType3;
    const vExpenseOuId = nextProps.value.expenseOuId;

    if (
      vReimType1 !== reimType1 ||
      vRreimType2 !== reimType2 ||
      vRreimType3 !== reimType3 ||
      vExpenseOuId !== expenseOuId
    ) {
      this.fetchData(vReimType1, vRreimType2, vRreimType3, vExpenseOuId);
    }
    this.setState({
      reimType1: vReimType1,
      reimType2: vRreimType2,
      reimType3: vRreimType3,
      expenseOuId: vExpenseOuId,
    });
  };

  render() {
    // const { reimType1, reimType2, reimType3, expenseOuId } = this.props.value;
    // console.log(this.props.value);

    const { value, loading } = this.state;

    return loading ? <Spin size="small" /> : <span>{value ? value.tmplName : '未检索到数据'}</span>;
  }
}

export default ShowReimTmplName;
