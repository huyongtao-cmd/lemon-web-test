import React from 'react';
import {Checkbox, Col, Dropdown, Form, Icon, Menu, Radio, Row} from 'antd';
import {WrappedFormUtils} from "antd/lib/form/Form";

import Link from "@/components/production/basic/Link";
import Card from "@/components/production/layout/Card";
import {localeString} from '@/components/production/basic/Locale';
import styles from "@/components/production/business/style/form.less";
import {ClickParam} from "antd/es/menu";

interface Props {
  showCardTitle?: boolean; // 是否展示card头部
  title?: string;
  form?: WrappedFormUtils;
  defaultAdvancedSearch?: boolean;
  getData(): void;
  operations?: React.ReactNode, // 查询重置按钮
  [propName: string]: any, // 其它属性
}

// 默认searchForm
const defaultSearchFormItemCount = 6;

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


class SearchForm extends React.PureComponent<Props, any> {

  constructor(props: Props) {
    super(props);
    const childrenList = (Array.isArray(props.children)) ? props.children : [props.children];
    const fieldsList = childrenList.filter((children) => children && children.props && children.props.visible && children.props.defaultShow && children.props.advanced);
    this.state = {
      layoutStyle: props.defaultLayoutStyle || LayoutStyleEnum.leftAndRight,
      columnStyle: props.defaultColumnStyle || ColumnStyleEnum.column3,
      expandSearchFormItem: false,
      searchAreaVisible: props.defaultSearchAreaVisible === undefined ? true : props.defaultSearchAreaVisible,
      advancedSearch: props.defaultAdvancedSearch === undefined ? false : props.defaultAdvancedSearch,
      fieldsList,
    };
  }

  /**
   * 右键菜单点击
   */
  handleMenuClick = (index:number) => {
    return ({key}: ClickParam) => {
      if (key === "DELETE") {
        this.setState((prevState: any) => {
          const {fieldsList} = prevState;
          fieldsList.splice(index,1);
          return {fieldsList: [...fieldsList]};
        });
      }
    };

  };

  /**
   * 渲染右键菜单
   */
  renderRightClickMenu = (index: number) => (
    <Menu onClick={this.handleMenuClick(index)}>
      <Menu.Item key="DELETE"><Icon type="close" />删除</Menu.Item>
    </Menu>
  );

  renderFormElement = (children: any, index: number) => {
    const {form, formMode, defaultSearchForm,getData, searchData, onStateChange} = this.props;
    const {advancedSearch} = this.state;
    let element;
    if (children && children.type && children.type.displayName === "SearchFormItem") {
      const {fieldMode, fieldKey, ...rest} = children.props;
      const mode = fieldMode || formMode;
      // let selectionListJson:any = {};

      // 高级查询fieldKey处理,name ==> name$1
      const handledFieldKey = advancedSearch?(fieldKey+"$"+index) :fieldKey;
      let initialValue = defaultSearchForm && defaultSearchForm[fieldKey];
      // const fieldType = children.props.fieldType;
      // if(fieldType.toLowerCase().indexOf("select") > -1){
      //   selectionListJson.descList = searchData && searchData[fieldKey+"DescList"];
      //
      // }

      element = advancedSearch?(
        <Dropdown overlay={this.renderRightClickMenu(index)} trigger={['contextMenu']} key={index}>
          <Col span={this.state.columnStyle}>
            {React.cloneElement(children,
              {
                className: "prod-form-item",
                fieldMode: mode,
                advancedSearch: advancedSearch, // 高级查询
                form,
                initialValue,
                onPressEnter:getData,
                // ...selectionListJson,
                ...this.state.layoutStyle === 'vertical' ? {} : {labelCol: {span: 6}, wrapperCol: {span: 18}},
                ...rest,
                fieldKey:handledFieldKey,
              })}
          </Col>
        </Dropdown>
      ):(
        <Col span={this.state.columnStyle} key={index}>
          {React.cloneElement(children,
            {
              className: "prod-form-item",
              fieldMode: mode,
              advancedSearch: advancedSearch, // 高级查询
              form,
              initialValue,
              onPressEnter:getData,
              // ...selectionListJson,
              ...this.state.layoutStyle === 'vertical' ? {} : {labelCol: {span: 6}, wrapperCol: {span: 18}},
              ...rest
            })}
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

  /**
   * 添加查询条件事件
   */
  handleAddConditionMenuClick = ({key}: ClickParam)=> {
    const {children} = this.props;
    const childrenList = (Array.isArray(children)) ? children : [children];
    this.setState((prevState: any) => {
      const {fieldsList} = prevState;
      const newFieldListTemp = childrenList.filter((field: any) => field.props.fieldKey === key);
      const newFieldList = fieldsList.concat(newFieldListTemp);
      const expandJson = newFieldList.length > defaultSearchFormItemCount ? {expandSearchFormItem:true}:{};
      return {fieldsList: newFieldList,...expandJson};
    });
  };

  /**
   * 渲染新增查询条件
   */
  renderAddConditionMenu = () => {
    const {children} = this.props;
    const childrenList = (Array.isArray(children)) ? children : [children];
    return (
      <Menu onClick={this.handleAddConditionMenuClick}>
        {childrenList.filter((children:any)=>children.props.advanced)
          .map((children:any)=><Menu.Item key={children.props.fieldKey}>{children.props.label}</Menu.Item>)}
      </Menu>
    );
  };

  getFields = () => {
    const {children,} = this.props;
    const {expandSearchFormItem, fieldsList,advancedSearch} = this.state;
    const childrenList: any[] = [];

    if(advancedSearch){
      fieldsList.forEach((item: object, index: number) => {
        if (index < defaultSearchFormItemCount || expandSearchFormItem) {
          childrenList.push(this.renderFormElement(item, index));
        }
      });
      // 新增查询条件按钮
      childrenList.push(this.renderFormElement(
        <Dropdown overlay={this.renderAddConditionMenu()}>
          <Link style={{lineHeight:"39px",marginLeft:"20px"}}>
            <Icon type="plus"/>新增
          </Link>
        </Dropdown>,
        -1));
    }else{
      const childrenListTemp = (Array.isArray(children)) ? children : [children];
      childrenListTemp.filter((children:any) => children && children.props.visible).forEach((item: React.ReactNode, index: number) => {
        if (index < defaultSearchFormItemCount || expandSearchFormItem) {
          childrenList.push(this.renderFormElement(item, index));
        }
      });
    }


    // if(Array.isArray(children)){
    //
    //   children.forEach((item,index)=>{
    //     if(index < defaultSearchFormItemCount || expandSearchFormItem){
    //       childrenList.push(this.renderFormElement(item,index));
    //     }
    //   });
    //
    // }else {
    //   childrenList.push(this.renderFormElement(children,1));
    // }

    return childrenList;
  };

  // 高级设置
  renderSearchSetting = () => {
    const menu = (
      <Menu>
        <Menu.Item>
          <Checkbox
            checked={this.state.searchAreaVisible}
            onChange={() => this.setState({searchAreaVisible: !this.state.searchAreaVisible})}
          >
            显示搜索区域
          </Checkbox>
        </Menu.Item>
        <Menu.Item>
          <Checkbox
            checked={this.state.advancedSearch}
            onChange={() => this.setState({advancedSearch: !this.state.advancedSearch})}
          >
            高级搜索
          </Checkbox>
        </Menu.Item>
      </Menu>
    );
    return menu;
  };

  /**
   * 处理searchForm 查询,清空等操作按钮,
   */
  renderSearchFormOperation = () => {
    const {operations,children} = this.props;
    const {fieldsList,advancedSearch} = this.state;
    const childrenListTemp = (Array.isArray(children)) ? children : [children];
    let fieldsCount = 0;
    if(advancedSearch){
      fieldsCount = fieldsList && (fieldsList as Array<any>).length;
    }else {
      fieldsCount = childrenListTemp.length;
    }
    return (
      <Row style={{marginTop: "20px"}}>
        <Col span={24} style={{textAlign: 'right'}}>
          {operations}
          { fieldsCount > defaultSearchFormItemCount &&
          <a style={{marginLeft: 8, fontSize: 12}}
             onClick={() => this.setState({expandSearchFormItem: !this.state.expandSearchFormItem})}>
            <Icon type={this.state.expandSearchFormItem ? 'up' : 'down'}/>
          </a>
          }

        </Col>
      </Row>
    );
  };

  // 表单布局设置
  renderFormSetting = () => {
    const {searchForm} = this.props;
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

  // 当删除查询条件
  // onDeleteFields = (fieldKey: string) => {
  //
  // };


  render() {
    const {
      showCardTitle,
      title,
      defaultColumnStyle,
      defaultAdvancedSearch,
      defaultSearchForm,
      form,
      getData,
      ...rest
    } = this.props;

    const {searchAreaVisible} = this.state;


    const extra = (
      <Dropdown overlay={this.renderSearchSetting()}>
        <Link style={{marginLeft: "5px"}}>高级</Link>
      </Dropdown>
    );


    return (
      <Card
        title={showCardTitle?title:undefined}
        size="small"
        extra={showCardTitle &&
          <>
            {extra}
            <Dropdown overlay={this.renderFormSetting()}>
              <Link style={{marginLeft: "5px"}}><Icon type="setting"/></Link>
            </Dropdown>
          </>
        }
      >
        {searchAreaVisible &&
        <Form
          className={`${styles['prod-form']}`}
          layout={this.state.layoutStyle}
          {...rest}
        >

          <Row gutter={0}>
            {this.getFields()}
          </Row>
          {this.renderSearchFormOperation()}
        </Form>}

      </Card>

    );
  }

}

export default SearchForm;
