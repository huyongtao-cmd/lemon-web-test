import { connect } from 'dva';
import React from 'react';
import { Map, Marker, Circle } from 'react-amap';
import { Input, Modal, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { Selection } from '@/pages/gen/field';

const { Field } = FieldList;

const fieldLayout = {
  labelCol: { span: 6, xxl: 6 },
  wrapperCol: { span: 18, xxl: 18 },
};

const DOMAIN = 'platAttendanceRuleEdit';

@connect(({ loading, platAttendanceRuleEdit, dispatch }) => ({
  loading,
  platAttendanceRuleEdit,
  dispatch,
}))
class LocationModal extends React.Component {
  state = {
    source: {
      name: '',
      siteDesc: '',
      siteLatitude: 0,
      siteLongitude: 0,
      siteRadius: undefined,
    },
    index: -1,
  };

  static getDerivedStateFromProps(nextProps) {
    const { source, index } = nextProps;
    return { source, index };
  }

  // 保存按钮
  handleSubmit = () => {
    const {
      toggle,
      dispatch,
      platAttendanceRuleEdit: { attendanceSiteEntity },
      form: { validateFieldsAndScroll },
    } = this.props;
    const { source, index } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (index < 0) {
          // 新建
          attendanceSiteEntity.push(source);
        } else {
          // 编辑
          attendanceSiteEntity.splice(index, 1, source);
        }
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            attendanceSiteEntity,
          },
        });
        toggle();
      }
    });
  };

  handleCancel = () => {
    const { toggle } = this.props;
    toggle();
  };

  changeData = (value, key) => {
    const { source } = this.state;
    source[key] = value;
    this.setState({ source });
  };

  initial = info => {
    const {
      position: { lat, lng },
    } = info;
    this.changeData(lat, 'siteLatitude');
    this.changeData(lng, 'siteLongitude');
  };

  render() {
    const {
      visible,
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const { source } = this.state;

    const events = {
      created: () => {
        let auto;
        let geocoder;
        let geolocation;

        // 初始获取当前位置
        // window.AMap.plugin('AMap.Geolocation', () => {
        //   geolocation = new window.AMap.Geolocation({
        //     enableHighAccuracy: true, // 是否使用高精度
        //     timeout: 10000, // 超过10秒后停止定位，默认：无穷大
        //     maximumAge: 1000, // 缓存毫秒数。定位成功后，定位结果的保留时间。默认0。
        //     zoomToAccuracy: true, // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        //   });
        //   geolocation.getCurrentPosition();
        //   window.AMap.event.addListener(geolocation, 'complete', this.initial); // 返回定位信息
        // });

        // 搜索自动补全
        window.AMap.plugin('AMap.Autocomplete', () => {
          auto = new window.AMap.Autocomplete({ input: 'tipinput' });
        });

        window.AMap.plugin('AMap.Geocoder', () => {
          geocoder = new window.AMap.Geocoder({
            radius: 1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
            extensions: 'all', // 返回地址描述以及附近兴趣点和道路信息，默认"base"
          });
        });

        // 搜索结果定位
        window.AMap.plugin('AMap.PlaceSearch', () => {
          const place = new window.AMap.PlaceSearch({});
          window.AMap.event.addListener(auto, 'select', e => {
            place.search(e.poi.name);
            geocoder.getAddress(e.poi.location, (status, result) => {
              if (status === 'complete' && result.regeocode) {
                const address = result.regeocode.formattedAddress;
                const data = result.regeocode.addressComponent;
                const name = data.township + data.street + data.streetNumber;

                this.changeData(address, 'siteDesc');
                this.changeData(name, 'name');
                this.changeData(e.poi.location.lng, 'siteLongitude');
                this.changeData(e.poi.location.lat, 'siteLatitude');
              }
            });
          });
        });
      },
      click: e => {
        let geocoder;

        // 点击结果定位
        window.AMap.plugin(['AMap.Geocoder'], () => {
          geocoder = new window.AMap.Geocoder({
            radius: 1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
            extensions: 'all', // 返回地址描述以及附近兴趣点和道路信息，默认"base"
          });
          geocoder.getAddress(e.lnglat, (status, result) => {
            if (status === 'complete' && result.regeocode) {
              const address = result.regeocode.formattedAddress;
              const data = result.regeocode.addressComponent;
              const name = data.township + data.street + data.streetNumber;

              this.changeData(address, 'siteDesc');
              this.changeData(name, 'name');
              this.changeData(e.lnglat.lng, 'siteLongitude');
              this.changeData(e.lnglat.lat, 'siteLatitude');
              setFieldsValue({
                siteDesc: address,
              });
            }
          });
        });
      },
    };

    return (
      <Modal
        title="打卡地点"
        width={950}
        visible={visible}
        destroyOnClose
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <Input id="tipinput" placeholder="搜索地点" style={{ margin: 8 }} />

        <div style={{ width: '100%', height: '400px', marginBottom: 10 }}>
          <Map
            amapkey="3f8b931b3931da2eb6c7f27d40524640"
            plugins={['ToolBar', 'Scale']}
            events={events}
            center={[source.siteLongitude, source.siteLatitude]}
            zoom={15}
          >
            <Marker position={[source.siteLongitude, source.siteLatitude]} />
            <Circle
              radius={source.siteRadius}
              style={{
                fillOpacity: 0.4,
                strokeWeight: 1,
                strokeColor: '#ff0000',
                fillColor: '#00ff00',
              }}
              center={[source.siteLongitude, source.siteLatitude]}
            />
          </Map>
        </div>

        <FieldList layout="horizontal" col={1} getFieldDecorator={getFieldDecorator}>
          <Field
            name="siteDesc"
            label="打卡地点"
            decorator={{
              initialValue: source.siteDesc,
              rules: [
                {
                  required: true,
                  message: '请选择打卡地点',
                },
              ],
            }}
            {...fieldLayout}
          >
            <Input placeholder="自动带出" disabled />
          </Field>
          <Field
            name="siteRadius"
            label="选择范围"
            decorator={{
              initialValue: source.siteRadius,
              rules: [
                {
                  required: true,
                  message: '请输入范围',
                },
              ],
            }}
            {...fieldLayout}
          >
            <Selection.UDC
              code="COM:ATTENDANCE_RANGE"
              placeholder="选择范围"
              value={source.siteRadius}
              onChange={e => this.changeData(e, 'siteRadius')}
            />
          </Field>
        </FieldList>
      </Modal>
    );
  }
}

export default Form.create()(LocationModal);
