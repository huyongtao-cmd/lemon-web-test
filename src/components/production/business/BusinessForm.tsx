import React, {ReactElement} from 'react';
import {omit, clone} from 'ramda';
import {Form, Icon, Row, Col, Dropdown, Menu, Radio, Checkbox} from 'antd';
import {WrappedFormUtils} from "antd/lib/form/Form";

import Link from "@/components/production/basic/Link";
import FormItem from "@/components/production/business/FormItem";
import Card from "@/components/production/layout/Card";
import {localeString} from '@/components/production/basic/Locale';

import styles from './style/form.less';

interface Props {
  form?: WrappedFormUtils;
  title?: string;
  formMode?: 'EDIT' | 'DESCRIPTION' | 'DISABLED' | string | undefined,
  formData?: any,
  defaultLayoutStyle?: "vertical" | "inline";
  defaultColumnStyle?: 8 | 12 | 24;
  extra?: React.ReactNode;

  [propName: string]: any, // 其它属性
}

interface States {
  layoutStyle: LayoutStyleEnum | string,
  columnStyle: ColumnStyleEnum | number,

  [propName: string]: any, // 其它属性
}


enum LayoutStyleEnum {
  // noLabel, // 无标签
  upAndLower = "vertical", // 上下
  leftAndRight = "inline", // 左右
}

enum ColumnStyleEnum {
  column3 = 8,
  column2 = 12,
  column1 = 24,
}

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 18},
};

const formItemRemarkLayout = {
  labelCol: {span: 3},
  wrapperCol: {span: 21},
};


class BusinessForm extends React.PureComponent<Props, any> {

  constructor(props: Props) {
    super(props);
    this.state = {
      layoutStyle: props.defaultLayoutStyle || LayoutStyleEnum.leftAndRight,
      columnStyle: props.defaultColumnStyle || ColumnStyleEnum.column2,
    };
  }

  renderFormElement = (children: any, index: number) => {
    const {form, formMode, formData} = this.props;
    let element;

    if (children && children.type.displayName === "FormItem") {
      const {fieldMode, fieldKey, form: itemForm, ...rest} = children.props;
      const mode = fieldMode || formMode;
      let selectionListJson: any = {};
      // 如果FormItem 上没有定义form，则使用BusinessForm的Form属性
      const wrappedForm = itemForm === undefined ? form : itemForm;
      let initialValue = formData && formData[fieldKey];
      const fieldType = children.props.fieldType;
      if(!fieldType){
        element = (
          <Col span={this.state.columnStyle} key={index}>
            {React.cloneElement(children,
              {
                form: wrappedForm,
                className: "prod-form-item",
                fieldMode: mode,
                formData,
                initialValue,
                ...selectionListJson,
                ...this.state.layoutStyle === 'vertical' ? {} : formItemLayout,
                ...rest
              })}
          </Col>)
        return element;
      }
      if (fieldType.toLowerCase().indexOf("select") > -1) {
        selectionListJson.descList = formData && formData[fieldKey + "DescList"];

      }
      if (fieldType === "BaseInputTextArea") {
        const labelTemp = this.state.columnStyle / 4;
        element = (
          <Col span={24} key={index}>
            {React.cloneElement(children,
              {
                form: wrappedForm,
                className: "prod-form-item",
                fieldMode: mode,
                formData,
                initialValue,
                ...this.state.layoutStyle === 'vertical' ? {} : {
                  labelCol: {span: labelTemp},
                  wrapperCol: {span: 24 - labelTemp}
                },
                ...rest,

              })}
          </Col>);
      } else if (fieldType === "BaseInputHidden") {
        element = (
          <Col span={0} key={index}>
            {React.cloneElement(children,
              {
                form: wrappedForm,
                className: "prod-form-item",
                fieldMode: mode,
                formData,
                initialValue,
                ...rest,

              })}
          </Col>);
      } else {
        element = (
          <Col span={this.state.columnStyle} key={index}>
            {React.cloneElement(children,
              {
                form: wrappedForm,
                className: "prod-form-item",
                fieldMode: mode,
                formData,
                initialValue,
                ...selectionListJson,
                ...this.state.layoutStyle === 'vertical' ? {} : formItemLayout,
                ...rest
              })}
          </Col>);
      }
    } else if(children && children.type.displayName === "BusinessFormTitle"){
      element = (
        <Col span={24} key={index}>
          {children}
        </Col>
      );
    } else {
      element = (
        <Col span={this.state.columnStyle} key={index}>
          {children}
        </Col>);
    }
    return element;
  };

  getFields = () => {
    const {
      children,
    } = this.props;
    if (!children) {
      return undefined;
    }
    let childrenTemp: Array<any>;
    if (Array.isArray(children)) {
      childrenTemp = children;
    } else {
      childrenTemp = [children];
    }
    childrenTemp = childrenTemp
      .filter((temp: any) => temp.props.visible !== false)
      .sort((a: any, b: any) => a.props.sortNo - b.props.sortNo);
    const childrenList: any[] = [];
    childrenTemp.forEach((item, index) => {
      childrenList.push(this.renderFormElement(item, index));
    });

    // if(Array.isArray(children)){
    //   children.forEach((item,index)=>{
    //     childrenList.push(this.renderFormElement(item,index));
    //   });
    // }else {
    //   childrenList.push(this.renderFormElement(children,1));
    // }
    return childrenList;
  };

  // 表单布局设置
  renderFormSetting = () => {
    const layoutStyleOptions = [
      {
        label: localeString({localeNo: 'portal:component:businessForm:layout:leftAndRight', defaultMessage: '左右布局'}),
        value: 'inline'
      },
      {
        label: localeString({localeNo: 'portal:component:businessForm:layout:upAndDown', defaultMessage: '上下布局'}),
        value: 'vertical'
      },
    ];
    const columnStyleOptions = [
      {
        label: localeString({localeNo: 'portal:component:businessForm:layout:oneColumn', defaultMessage: '1列'}),
        value: 24
      },
      {
        label: localeString({localeNo: 'portal:component:businessForm:layout:twoColumn', defaultMessage: '2列'}),
        value: 12
      },
      {
        label: localeString({localeNo: 'portal:component:businessForm:layout:threeColumn', defaultMessage: '3列'}),
        value: 8
      },
    ];
    const menu = (
      <Menu>
        <Menu.Item>
          <Radio.Group
            options={layoutStyleOptions}
            value={this.state.layoutStyle}
            onChange={(radio) => {
              this.setState({layoutStyle: radio.target.value})
            }}
          />
        </Menu.Item>
        <Menu.Item>
          <Radio.Group
            options={columnStyleOptions}
            value={this.state.columnStyle}
            onChange={(radio) => {
              this.setState({columnStyle: radio.target.value})
            }}
          />
        </Menu.Item>
      </Menu>
    );
    return menu;
  };


  render() {
    const {
      form,
      extra = [],
      defaultColumnStyle,
      ...rest
    } = this.props;

    const formProps = omit(['formData', 'formMode', 'title'], rest);

    return (
      <Card
        title={this.props.title}
        size="small"
        extra={
          <>
            {extra}
            <Dropdown overlay={this.renderFormSetting()}>
              <Link style={{marginLeft: "5px"}}><Icon type="setting"/></Link>
            </Dropdown>
          </>
        }
      >
        <Form
          className={`${styles['prod-form']}`}
          layout={this.state.layoutStyle}
          {...formProps}
        >

          <Row gutter={0}>
            {this.getFields()}
          </Row>
        </Form>
      </Card>
    );
  }

}

export default BusinessForm;
