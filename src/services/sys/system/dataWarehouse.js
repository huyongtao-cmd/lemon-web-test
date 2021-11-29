import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  dataMartCreateUri,
  dataMartModifyUri,
  dataMartDetailUri,
  dataMartListPagingUri,
  dataMartLogicalDeleteUri,

  dataMartUri,

  dataChartCreateUri,
  dataChartModifyUri,
  dataChartDetailUri,
  dataChartListPagingUri,
  dataChartLogicalDeleteUri,
  dataChartAllByNoUri,

  dataExtractCreateUri,
  dataExtractModifyUri,
  dataExtractDetailUri,
  dataExtractListPagingUri,
  dataExtractLogicalDeleteUri,
  dataExtractRunUri,

  dataPresentCreateUri,
  dataPresentModifyUri,
  dataPresentDetailUri,
  dataPresentListPagingUri,
  dataPresentLogicalDeleteUri,

  dataWarehouseTableCreateUri,
  dataWarehouseTableModifyUri,
  dataWarehouseTableDetailUri,
  dataWarehouseTableListPagingUri,
  dataWarehouseTableLogicalDeleteUri,

  dataWarehouseCreateUri,
  dataWarehouseModifyUri,
  dataWarehouseDetailUri,
  dataWarehouseListPagingUri,
  dataWarehouseLogicalDeleteUri,
} = api.sys.system;

// 数据仓库
export async function dataMart(param) {
  return request.get(toUrl(dataMartUri, param));
}

// 数据集
export async function dataMartCreate(param) {
  return request.post(dataMartCreateUri, { body: param });
}
export async function dataMartModify(param) {
  return request.put(dataMartModifyUri, { body: param });
}
export async function dataMartDetail(param) {
  return request.get(toUrl(dataMartDetailUri, param));
}
export async function dataMartListPaging(param) {
  return request.get(toQs(dataMartListPagingUri, param));
}
export async function dataMartLogicalDelete(param) {
  return request.patch(toQs(dataMartLogicalDeleteUri, param));
}

// 图表配置
export async function dataChartCreate(param) {
  return request.post(dataChartCreateUri, { body: param });
}
export async function dataChartModify(param) {
  return request.put(dataChartModifyUri, { body: param });
}
export async function dataChartDetail(param) {
  return request.get(toUrl(dataChartDetailUri, param));
}
export async function dataChartListPaging(param) {
  return request.get(toQs(dataChartListPagingUri, param));
}
export async function dataChartLogicalDelete(param) {
  return request.patch(toQs(dataChartLogicalDeleteUri, param));
}
export async function dataChartAllByNo(param) {
  return request.get(toQs(toUrl(dataChartAllByNoUri, param), param));
}

// 数据抽取
export async function dataExtractCreate(param) {
  return request.post(dataExtractCreateUri, { body: param });
}
export async function dataExtractModify(param) {
  return request.put(dataExtractModifyUri, { body: param });
}
export async function dataExtractDetail(param) {
  return request.get(toUrl(dataExtractDetailUri, param));
}
export async function dataExtractListPaging(param) {
  return request.get(toQs(dataExtractListPagingUri, param));
}
export async function dataExtractLogicalDelete(param) {
  return request.patch(toQs(dataExtractLogicalDeleteUri, param));
}
export async function dataExtractRun(param) {
  return request.patch(toUrl(dataExtractRunUri, param));
}

// 数据展现
export async function dataPresentCreate(param) {
  return request.post(dataPresentCreateUri, { body: param });
}
export async function dataPresentModify(param) {
  return request.put(dataPresentModifyUri, { body: param });
}
export async function dataPresentDetail(param) {
  return request.get(toUrl(dataPresentDetailUri, param));
}
export async function dataPresentListPaging(param) {
  return request.get(toQs(dataPresentListPagingUri, param));
}
export async function dataPresentLogicalDelete(param) {
  return request.patch(toQs(dataPresentLogicalDeleteUri, param));
}

// 数据仓库表
export async function dataWarehouseTableCreate(param) {
  return request.post(dataWarehouseTableCreateUri, { body: param });
}
export async function dataWarehouseTableModify(param) {
  return request.put(dataWarehouseTableModifyUri, { body: param });
}
export async function dataWarehouseTableDetail(param) {
  return request.get(toUrl(dataWarehouseTableDetailUri, param));
}
export async function dataWarehouseTableListPaging(param) {
  return request.get(toQs(dataWarehouseTableListPagingUri, param));
}
export async function dataWarehouseTableLogicalDelete(param) {
  return request.patch(toQs(dataWarehouseTableLogicalDeleteUri, param));
}

// 数据仓库表数据
export async function dataWarehouseCreate(param) {
  return request.post(dataWarehouseCreateUri, { body: param });
}
export async function dataWarehouseModify(param) {
  return request.put(dataWarehouseModifyUri, { body: param });
}
export async function dataWarehouseDetail(param) {
  return request.get(toUrl(dataWarehouseDetailUri, param));
}
export async function dataWarehouseListPaging(param) {
  return request.get(toQs(dataWarehouseListPagingUri, param));
}
export async function dataWarehouseLogicalDelete(param) {
  return request.patch(toQs(dataWarehouseLogicalDeleteUri, param));
}
