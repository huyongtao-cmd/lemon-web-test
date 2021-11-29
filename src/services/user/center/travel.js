import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

// TODO: change
const {
  list,
  travel,
  travelSave,
  travelsDel,
  travelApply, // travelReApply
  travelDels,
  travelFeeCode,
} = api.user.travel;

const { ticketMgmtPersonal } = api.user.center;

export async function queryUserTravel(params) {
  return request.get(toQs(list, params));
}

export async function findTravelById({ id }) {
  return request.get(toUrl(travel, { id }));
}

export async function saveTravel(params) {
  return request.put(travelSave, { body: params });
}

export async function deleteTravelByIds({ ids }) {
  return request.patch(toUrl(travelsDel, { ids: ids.join(',') }));
}

// 流程
export async function submitTravelApply({ id }) {
  return request.post(toUrl(travelApply, { id }));
}

export async function findTravelDelsById({ id }) {
  return request.get(toUrl(travelDels, { id }));
}

export async function queryTicketInfoList(params) {
  return request.get(toQs(ticketMgmtPersonal, params));
}

export async function queryFeeCode(params) {
  return request.get(toQs(travelFeeCode, params));
}
