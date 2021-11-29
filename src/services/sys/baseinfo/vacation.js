import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  selectWorkHoursByDateUri,
  queryVacationList,
  queryJdeExportList,
  saveVacation,
  saveJdeExport,
} = api.sys;

export async function queryVacationListMethod(year) {
  return request.get(queryVacationList.replace('{year}', year));
}

export async function queryJdeExportListMethod(year) {
  return request.get(queryJdeExportList.replace('{year}', year));
}

export async function saveVacationMethod(vacations) {
  return request.put(saveVacation, { body: vacations });
}

export async function saveJdeExportMethod(configs) {
  return request.put(saveJdeExport, { body: configs });
}

export async function selectWorkHoursByDate(param) {
  return request.get(toQs(selectWorkHoursByDateUri, param));
}
