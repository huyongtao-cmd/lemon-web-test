/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Input, Row, Button, Popover } from 'antd';

import styles from './styles.less';

import indicator_closed from './indicator_closed.svg';
import indicator_open from './indicator_open.svg';

const FormItem = Form.Item;
// const Search = Input.Search

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
  colon: false,
};

const ColProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 8,
  xl: 8,
  style: {
    // marginBottom: 16,
  },
};

const TwoColProps = {
  ...ColProps,
  xl: 96,
};

@Form.create({
  onFieldsChange(props, field) {
    // console.log(field);
  },
  onValuesChange(props, changedValues, allValues) {
    // console.warn(props, changedValues, allValues);
    props.onSearchBarChange(changedValues, allValues);
  },
})
class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
  }

  getFieldsValue = () => {
    const {
      form: { getFieldsValue },
    } = this.props;
    return getFieldsValue();
  };

  handleSearch = () => {
    const { onSearchBarSearch } = this.props;
    onSearchBarSearch();
  };

  handleReset = () => {
    const {
      form: { resetFields, getFieldsValue },
      onSearchBarChange,
    } = this.props;
    resetFields();
    const searchForm = getFieldsValue();
    const resetForm = Object.keys(searchForm).reduce((prev, curr) => {
      return { ...prev, [curr]: undefined };
    }, {});
    onSearchBarChange(resetForm);
  };

  renderItemTag = item => {
    let itemTag = item.tag;
    if (itemTag) {
      // if (typeof itemTag === 'function') {
      //   itemTag = itemTag(handleSearch);
      // }
      // console.log(itemTag);
      if (itemTag.props.prefixCls === 'ant-input') {
        return React.cloneElement(itemTag, { onPressEnter: this.handleSearch });
      }
      return React.cloneElement(itemTag);
    }
    return <Input onPressEnter={this.handleSearch} />;
  };

  renderItem = item => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Col key={item.dataIndex} {...ColProps} {...item.colProps}>
        <FormItem {...formItemLayout} {...item.formItemLayout} label={item.title}>
          {getFieldDecorator(item.dataIndex, { ...item.options })(this.renderItemTag(item))}
        </FormItem>
      </Col>
    );
  };

  toggleCollapsed() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const { searchBarForm, showClear } = this.props;

    return (
      <div
        className={styles.searchBar}
        style={{
          height: this.state.collapsed ? 60 : '100%',
        }}
      >
        <Form className={styles.formFlex}>
          <Row className={styles.formFlexContent} gutter={6}>
            {searchBarForm.map(item => this.renderItem(item))}
          </Row>
          {showClear && (
            <Popover content="清空" placement="bottomRight">
              <Button
                className={styles.formFlexTail}
                icon="redo"
                shape="circle"
                size="large"
                onClick={this.handleReset}
              />
            </Popover>
          )}
        </Form>

        {searchBarForm.length > 3 && (
          <div className={styles.indicator}>
            <img
              src={this.state.collapsed ? indicator_open : indicator_closed}
              onClick={this.toggleCollapsed.bind(this)}
            />
          </div>
        )}
      </div>
    );
  }
}

SearchBar.propTypes = {
  searchBarForm: PropTypes.array.isRequired,
  onSearchBarSearch: PropTypes.func.isRequired,
  onSearchBarChange: PropTypes.func,
};

export default SearchBar;
