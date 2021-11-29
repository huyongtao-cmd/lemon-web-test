import React from 'react';
import { DatePicker, Button } from 'antd';
import { formatMessage } from 'umi/locale';

const { RangePicker } = DatePicker;

class MonthRangePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: ['month', 'month'],
      value: props.value,
      open: false,
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

  handlePanelChange = (value, mode) => {
    this.setState(
      {
        value,
        mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]],
      },
      () => {
        const { onChange } = this.props;
        onChange && onChange(value);
      }
    );
  };

  onOpenChange = status => this.togglePicker(status);

  togglePicker = status => this.setState({ open: status });

  handleOk = () => {
    const { onChange } = this.props;
    const { value } = this.state;
    this.togglePicker(false);
    onChange && onChange(value);
  };

  renderFooter = () => (
    <Button className="tw-btn-primary" onClick={() => this.handleOk()}>
      {formatMessage({ id: 'misc.confirm', desc: '确认' })}
    </Button>
  );

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
