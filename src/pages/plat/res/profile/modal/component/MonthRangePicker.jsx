import React from 'react';
import { DatePicker, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';

const { RangePicker } = DatePicker;

class MonthRangePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: ['month', 'month'],
      value: props.value,
      open: false,
      // eslint-disable-next-line no-unneeded-ternary
      sofar: props.value && props.value[1] ? false : true,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.value !== prevState.value) {
      return {
        value: nextProps.value,
      };
    }
    return null;
  }

  componentDidMount() {
    const { sofar, value } = this.state;
    if (sofar && (value && value[0])) {
      document.getElementsByClassName('ant-calendar-range-picker-input')[1]
        ? (document.getElementsByClassName('ant-calendar-range-picker-input')[1].value = '至今')
        : null;
      document.getElementsByClassName('ant-calendar-input')[1]
        ? (document.getElementsByClassName('ant-calendar-input')[1].value = '至今')
        : null;
    }
  }

  componentDidUpdate() {
    const { sofar, value } = this.state;
    if (sofar && (value && value[0])) {
      document.getElementsByClassName('ant-calendar-range-picker-input')[1]
        ? (document.getElementsByClassName('ant-calendar-range-picker-input')[1].value = '至今')
        : null;
      document.getElementsByClassName('ant-calendar-input')[1]
        ? (document.getElementsByClassName('ant-calendar-input')[1].value = '至今')
        : null;
    }
  }

  handlePanelChange = (value, mode) => {
    const { handleSofar } = this.props;
    handleSofar && handleSofar(false);
    this.setState(
      {
        value,
        mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]],
        sofar: false,
      },
      () => {
        const { onChange } = this.props;
        onChange && onChange(value);
      }
    );
  };

  onOpenChange = status => {
    this.togglePicker(status);
  };

  togglePicker = status => {
    this.setState({ open: status });
  };

  handleOk = () => {
    const { onChange, handleSofar } = this.props;
    const { value } = this.state;
    handleSofar && handleSofar(false);
    this.setState({
      sofar: false,
    });
    this.togglePicker(false);
    onChange && onChange(value);
  };

  handleSofar = () => {
    const { handleSofar } = this.props;
    handleSofar && handleSofar(true);
    this.setState({
      sofar: true,
    });
    this.togglePicker(false);
  };

  renderFooter = () => {
    const { value } = this.state;
    return (
      <>
        <Button className="tw-btn-primary" onClick={() => this.handleOk()}>
          {formatMessage({ id: 'misc.confirm', desc: '确认' })}
        </Button>
        <Button
          disabled={!(value && value[0])}
          style={{ marginLeft: '8px' }}
          className="tw-btn-primary"
          onClick={() => this.handleSofar()}
        >
          至今
        </Button>
      </>
    );
  };

  render() {
    const { value: initialValue, ...restProps } = this.props;
    const { value, mode, open } = this.state;
    return (
      <RangePicker
        placeholder={[
          formatMessage({ id: 'plat.res.content.startDate', desc: '开始日期' }),
          formatMessage({ id: 'plat.res.content.endDate', desc: '结束日期' }),
        ]}
        format="YYYY-MM"
        value={value}
        mode={mode}
        open={open}
        onOpenChange={this.onOpenChange}
        onPanelChange={this.handlePanelChange}
        renderExtraFooter={this.renderFooter}
        {...restProps}
      />
    );
  }
}

export default MonthRangePicker;
