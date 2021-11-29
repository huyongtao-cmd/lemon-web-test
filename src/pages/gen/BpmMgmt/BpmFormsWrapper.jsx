import React, { createContext } from 'react';
import { Form, Card, Divider } from 'antd';
import { isEmpty, filter, pick, equals } from 'ramda';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { getGuid } from '@/utils/stringUtils';
import BpmForm from './BpmForm';

const { Description } = DescriptionList;

const defaultCol = 2;

@Form.create({})
class BpmForms extends React.Component {
  constructor(props) {
    super(props);
    this.ContextFields = createContext();
    this.state = {
      formData: props.formData || {},
      fields: props.fields || [],
      fieldsConfig: props.fieldsConfig || [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const compareList = ['formData', 'fields', 'fieldsConfig'];
    const next = pick(compareList, nextProps);
    const prev = pick(compareList, prevState);
    if (!equals(next, prev)) {
      return {
        ...next,
      };
    }
    return null;
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { fieldsConfig = [] } = this.state;

    if (isEmpty(fieldsConfig)) return null;
    const filteredConfig = fieldsConfig.filter(field => !field.hidden).filter(Boolean);
    // calc the count
    const count = filteredConfig.length;
    if (!count || count === 0) return null;

    return (
      <Card
        title={<Title icon="profile" id="app.setting.flow.form" defaultMessage="流程表单" />}
        className="tw-card-adjust x-fill-100"
        style={{ marginBottom: 4 }}
      >
        {filteredConfig.map((config, index) => {
          const { disabled = false, cardId, items = [] } = config;
          const { fields, formData = {} } = this.state;
          const correctBlock = filter(x => x.cardId === cardId, fields)[0];
          if (!correctBlock || disabled) return null; // 这个情况其实不会出现的，除非 json 配错了
          const { title = '', items: localItems = [], col = defaultCol } = correctBlock;
          return (
            <Card
              className="tw-card-adjust"
              key={getGuid(cardId)}
              bordered={false}
              bodyStyle={{ padding: 0 }}
            >
              <this.ContextFields.Provider
                value={{
                  getFieldDecorator,
                  title,
                  col,
                  items,
                  localItems,
                  formData,
                }}
              >
                <BpmForm Consumer={this.ContextFields.Consumer} />
              </this.ContextFields.Provider>
              {index + 1 !== filteredConfig.length && <Divider dashed />}
            </Card>
          );
        })}
      </Card>
    );
  }
}

export default BpmForms;
