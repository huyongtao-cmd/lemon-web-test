import React, { PureComponent } from 'react';
import {
  Table,
  Icon,
  Card,
  Button,
  Checkbox,
  Select,
  Tooltip,
  InputNumber,
  Input,
  Form,
} from 'antd';
import EditTableContext from './EditTableContext';

const FormItem = Form.Item;

class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    let { editing } = this.state;
    editing = !editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      let field;
      let projShId;
      let newValue;
      Object.keys(values).forEach(key => {
        const index = key.lastIndexOf('_');
        field = key.substring(0, index);
        projShId = key.substring(index + 1);
        newValue = values[key];
      });
      handleSave({ projActId: record.id, field, projShId, newValue });
    });
  };

  render() {
    const { editing } = this.state;
    const { editable, dataIndex, title, record, index, handleSave, ...restProps } = this.props;
    let projShId;
    if (dataIndex) {
      const temp = dataIndex.split('_');
      projShId = temp[temp.length - 1];
    }

    return (
      <td {...restProps}>
        {editable && record['res_' + projShId] === 'checked' ? (
          <EditTableContext.Consumer>
            {form => {
              this.form = form;
              return editing ? (
                <FormItem style={{ margin: 0 }}>
                  {dataIndex.indexOf('plan_eqva') === 0
                    ? form.getFieldDecorator(dataIndex, {
                        // rules: [{
                        //   required: true,
                        //   message: `${title} is required.`,
                        // }],
                        initialValue: record[dataIndex],
                      })(
                        <InputNumber
                          ref={node => {
                            this.input = node;
                          }}
                          onPressEnter={this.save}
                          onBlur={this.save}
                        />
                      )
                    : form.getFieldDecorator(dataIndex, {
                        initialValue: record[dataIndex],
                      })(
                        <InputNumber
                          ref={node => {
                            this.input = node;
                          }}
                          onPressEnter={this.save}
                          onBlur={this.save}
                        />
                      )}
                </FormItem>
              ) : (
                <div
                  className="editable-cell-value-wrap"
                  style={{ color: 'blue', textDecoration: 'underline' }}
                  onClick={this.toggleEdit}
                >
                  {restProps.children[2] !== undefined && restProps.children[2] !== null
                    ? restProps.children
                    : '空'}
                  {/* restProps.children */}
                </div>
              );
            }}
          </EditTableContext.Consumer>
        ) : (
          restProps.children
        )}
      </td>
    );
  }
}

export default EditableCell;
