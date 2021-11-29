import React, { Component } from 'react';
import { Input, Select, Button, Row, Icon } from 'antd';
import { omit, isEmpty } from 'ramda';
import MultiSourceSelect from './MultiSourceSelect';
import styles from './styles.less';

const { Option } = Select;

const transferArray = value =>
  // eslint-disable-next-line
  Object.values(value).reduce((prev, curr) => {
    return [...prev, ...curr];
  }, []);

const transferOuterValue = (value = {}, singleSource = false) => {
  if (isEmpty(value) || value === null) return {};
  if (singleSource) {
    // 针对单数据源的来源转换
    const { source, members, memberNames } = value;
    // 关于name 取不到就显示code
    // eslint-disable-next-line
    const array = members.map(code => {
      return { code, name: memberNames[code] || code };
    });
    return {
      [source]: array,
    };
  }
  // TODO: 以后增加多数据源，这里对应好就行了，现在 return {}
  return {};
};

class Index extends Component {
  constructor(props) {
    super(props);
    const transferedValue = transferOuterValue(props.value, props.singleSource);
    this.state = {
      value: transferedValue,
      initialValue: transferArray(transferedValue),
      visible: false,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      // mock async request, avoid overflow
      setTimeout(() => {
        this.setState({ value: transferOuterValue(snapshot, true) });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { value } = this.props;
    if (prevProps.value !== value) {
      return value;
    }
    return null;
  }

  showModal = () => this.setState({ visible: true });

  hideModal = () => this.setState({ visible: false });

  onOk = stores => {
    this.setState(
      {
        visible: false,
        initialValue: transferArray(stores),
        value: stores,
      },
      () => {
        const { onChange } = this.props;
        if (onChange) {
          onChange(stores);
        }
      }
    );
  };

  onChange = (value, option) => {
    const { dataSource } = this.props;
    const newStores = dataSource
      // eslint-disable-next-line
      .map(({ name }) => {
        return {
          [name]: [],
        };
      })
      // eslint-disable-next-line
      .reduce((prev, curr) => {
        return { ...prev, ...curr };
      }, {});
    // eslint-disable-next-line
    option.map(({ props }) => {
      const { sourcename, sourceitem } = props;
      newStores[sourcename].push(sourceitem);
    });
    this.setState(
      {
        initialValue: transferArray(newStores),
      },
      () => {
        const { onChange } = this.props;
        onChange && onChange(newStores);
      }
    );
  };

  renderSelect = () => {
    const { disabled = false } = this.props;
    const { initialValue, value } = this.state;
    if (isEmpty(value)) {
      return <Input disabled />;
    }
    return (
      <Select
        disabled={disabled}
        mode="multiple"
        value={initialValue.map(({ name }) => name)}
        onChange={this.onChange}
        style={{ flex: 1 }}
      >
        {Object.keys(value).map(key => {
          const list = value[key];
          return list.map(({ name, code }) => (
            <Option key={name} sourcename={key} sourceitem={{ name, code }}>
              {name}
            </Option>
          ));
        })}
      </Select>
    );
  };

  render() {
    const { visible, value } = this.state;
    const { disabled = false } = this.props;
    const selectProps = omit(['onChange', 'visible', 'value'], this.props);
    return (
      <>
        <Row
          className={styles.group}
          type="flex"
          align="middle"
          justify="start"
          style={{ flexWrap: 'nowrap', width: '100%' }}
        >
          {this.renderSelect()}
          {!disabled && (
            <Button className={styles.groupBtn} icon="setting" onClick={this.showModal} />
          )}
        </Row>
        <MultiSourceSelect
          visible={visible}
          value={value}
          onCancel={this.hideModal}
          {...selectProps}
          onOk={this.onOk}
        />
      </>
    );
  }
}

export default Index;
