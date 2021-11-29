import React,{Suspense,lazy} from 'react';
import JsBarcode from 'jsbarcode';

interface Props {
  content: string,
  height?: number,
  width?: number,
  margin?: number,
  displayValue?: boolean,

}

class BarCode extends React.Component<Props, any> {


  componentDidMount(): void {
    const { content, height=50, width=1.5, margin=0, displayValue=false } = this.props;
    if(content&&content.length>0){
      JsBarcode(
        this.barcode,
        content,
        {
          displayValue: displayValue,
          width: width,
          height: height,
          margin: margin,
        });
    }

  }

  barcode:any;

  render() {
    const {...rest} = this.props;
    return (
      <img
        {...rest}
        ref={ref => {this.barcode = ref}}
      />

    );
  };
}

export default BarCode;
