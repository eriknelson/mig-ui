import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // import plugin
import utc from 'dayjs/plugin/utc'; // import plugin
dayjs.extend(utc);
dayjs.extend(timezone);
import { IToken } from '../../../token/duck/types';
import { StatusType } from '@konveyor/lib-ui';

const EXPIRATION_WARNING_THRESHOLD_HOURS = 1;

export const getTokenInfo = (token: IToken) => {
  const retTokenInfo = {
    tokenName: token.MigToken.metadata.name,
    associatedClusterName: token.MigToken.spec.migClusterRef.name,
    type: 'Loading...',
    expirationTimestamp: 'Loading...',
    formattedExpiration: 'Loading...',
    tokenStatus: null,
    statusType: StatusType.Ok,
  };
  if (token.MigToken.status?.conditions) {
    const expirationTimestamp = token.MigToken.status.expiresAt;
    dayjs(expirationTimestamp);
    const expirationMoment = expirationTimestamp && dayjs(expirationTimestamp);
    const formattedExpiration = expirationMoment
      ? expirationMoment.tz(dayjs.tz.guess()).format('DD MMM YYYY, hh:mm:ss A z')
      : 'Never';
    let statusType = StatusType.Ok;
    let statusText = 'OK';
    if (expirationMoment) {
      const hoursUntilExpiration = expirationMoment.diff(dayjs(), 'h', true);
      if (hoursUntilExpiration < 0) {
        statusType = StatusType.Error;
        statusText = 'Expired';
      } else if (hoursUntilExpiration < EXPIRATION_WARNING_THRESHOLD_HOURS) {
        statusType = StatusType.Warning;
        statusText = 'Expiring soon';
      }
    }
    const hasCriticalCondition = token.MigToken.status.conditions.some(
      (c) => c.category === 'Critical'
    );
    retTokenInfo.expirationTimestamp = expirationTimestamp;
    retTokenInfo.formattedExpiration = formattedExpiration;
    retTokenInfo.type = token.MigToken.status.type;
    retTokenInfo.tokenStatus = !token.MigToken.status
      ? null
      : token.MigToken.status.conditions.filter((c) => c.type === 'Ready').length > 0;
    retTokenInfo.statusType = hasCriticalCondition ? StatusType.Error : StatusType.Ok;
  }

  return retTokenInfo;
};

export type ITokenInfo = ReturnType<typeof getTokenInfo>;
