import React from 'react';
import { omit, filter, isEmpty } from 'ramda';
import { Modal, Alert, Button, Tag, Card, Divider } from 'antd';
// import PropTypes from 'prop-types';
import Title from '@/components/layout/Title';
import { formatMessage } from 'umi/locale';
import SourceChosen from './SourceChosen';
import styles from './styles.less';

const TAB_CONTENT_HEIGHT = 400;

const compileDataSourceToState = (source = []) => {
  if (!source.length) return undefined;
  const firstly = source[0];
  return {
    dataSource: source,
    tabKey: firstly.name || '',
  };
};

const compileList = (sources = [], prevState) => {
  // eslint-disable-next-line
  const tabList = sources.map(({ name }, index) => {
    return {
      key: name,
      tab: name === 'tw:flow:role' || name === 'tw:bpm:role' ? '流程角色' : name,
    };
  });
  const columnsList = sources
    // eslint-disable-next-line
    .map(({ name, columns }) => {
      return { [name]: columns };
    })
    // eslint-disable-next-line
    .reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});
  return {
    tabList,
    columnsList,
  };
};

class MultiSourceSelect extends React.Component {
  // static propTypes = {
  //   dataSource: PropTypes.arrayOf(
  //     PropTypes.objectOf(PropTypes.shape({
  //       name: PropTypes.string.isRequired,
  //       columns: PropTypes.array.isRequired,
  //     }))
  //   ),
  //   singleSource: PropTypes.bool,
  // }

  static defaultProps = {
    dataSource: [],
    singleSource: false,
  };

  state = {
    dataSource: [],
    singleSource: false,
    value: {}, // type -> '{sourceName:[code, code]}'
    tabKey: '',
    tabList: [],
    columnsList: [],
    stores: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { dataSource, value = {}, singleSource } = nextProps;
    if (dataSource !== prevState.dataSource || value !== prevState.value) {
      const dataSourceState = compileDataSourceToState(dataSource);
      const list = compileList(dataSource, prevState);
      return {
        ...dataSourceState,
        ...list,
        singleSource,
        value,
        stores: isEmpty(value) ? {} : value,
      };
    }
    return null;
  }

  handleDelete = (name, sourceName) => {
    const { stores } = this.state;
    const list = stores[sourceName];
    const newList = filter(x => x.name !== name, list);
    if (isEmpty(newList)) {
      const newStores = {
        ...omit([sourceName], stores),
      };
      this.setState({
        stores: newStores,
      });
    } else {
      const newStores = {
        ...omit([sourceName], stores),
        [sourceName]: newList,
      };
      this.setState({
        stores: newStores,
      });
    }
  };

  onOk = () => {
    const { stores } = this.state;
    const { onOk } = this.props;
    if (onOk) onOk(stores);
  };

  onTabChange = key => {
    this.setState({ tabKey: key });
  };

  onAdd = (sourceName, selectedItems, allItems) => {
    const { singleSource, stores } = this.state;

    // eslint-disable-next-line
    const transferItems = selectedItems.map(item => {
      const { code, name, entity = {} } = item;
      const { id } = entity;
      return { code, name, id };
    });
    if (singleSource) {
      const hasName = Object.keys(stores).includes(sourceName);
      if (hasName) {
        const storedList = stores[sourceName];
        const newStroedList = Array.from(new Set([...storedList, ...transferItems]));
        const newStroes = { [sourceName]: newStroedList };
        this.setState({ stores: newStroes });
      } else {
        const newSotres = { [sourceName]: transferItems };
        this.setState({ stores: newSotres });
      }
    } else {
      const hasName = Object.keys(stores).includes(sourceName);
      if (hasName) {
        const storedList = stores[sourceName];
        const newStroedList = Array.from(new Set([...storedList, ...transferItems]));
        const newStroes = {
          ...stores,
          [sourceName]: newStroedList,
        };
        this.setState({ stores: newStroes });
      } else {
        const newStroedList = {
          ...omit([sourceName], stores),
          [sourceName]: transferItems,
        };
        this.setState({ stores: newStroedList });
      }
    }
    return true;
  };

  renderStores = () => {
    const { stores } = this.state;
    const empty = isEmpty(stores);
    if (empty) return <span>{formatMessage({ id: 'misc.void', desc: '空' })}</span>;
    return Object.keys(stores).map(key => {
      const list = stores[key];
      return (
        <React.Fragment key={key}>
          <div className="tw-card-title">
            {key === 'tw:flow:role' || key === 'tw:bpm:role' ? '流程角色' : key}
          </div>
          <div className={styles.selectedStores}>
            {list.map(({ name }) => (
              <Tag
                key={name}
                className={styles.store}
                color="blue"
                closable
                onClose={() => this.handleDelete(name, key)}
              >
                {name || ''}
              </Tag>
            ))}
          </div>
        </React.Fragment>
      );
    });
  };

  render() {
    const { visible = true, onCancel, operate, checkBox, multipleSelect = true } = this.props;
    const { tabKey, tabList, columnsList, singleSource, stores } = this.state;
    return (
      <Modal
        title={formatMessage({ id: 'app.hint.select', desc: '请选择' })}
        width={1000}
        visible={visible}
        onOk={this.onOk}
        onCancel={onCancel}
        bodyStyle={{
          height: 600,
          overflowY: 'auto',
        }}
      >
        <Card className="tw-card-adjust" bordered={false}>
          {this.renderStores()}
        </Card>
        <Divider dashed />
        <Card
          className="tw-card-adjust"
          bordered={false}
          activeTabKey={tabKey}
          tabList={tabList}
          onTabChange={this.onTabChange}
        >
          <SourceChosen
            chosenHeight={TAB_CONTENT_HEIGHT}
            sourceName={tabKey}
            sourceColumns={columnsList[tabKey]}
            onAdd={this.onAdd}
            operate={operate}
            checkBox={checkBox}
            multipleSelect={multipleSelect}
            selectList={stores}
          />
        </Card>
      </Modal>
    );
  }
}

export default MultiSourceSelect;
