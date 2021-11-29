import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { resTrainingProgSelect, resTrainingProgDel, resTrainingProgSelTrain } = api.user.center;

export async function resTrainingProgSelectRq(payload) {
  return request.get(toUrl(resTrainingProgSelect, payload));
}

export async function resTrainingProgDelRq(payload) {
  return request.delete(toUrl(resTrainingProgDel, payload));
}

export async function resTrainingProgSelTrainRq(payload) {
  return request.get(toUrl(resTrainingProgSelTrain, payload));
}
