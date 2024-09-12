import getActualPeriod from './generic/getActualPeriod';
import colorByLetter from './dicc';
import getTTLDate from './generic/getTTLDate';
import getDateFromTimeStamp from './generic/getDateFromTimeStamp';
import hexToText from './generic/hexToText';
import getTimeLive from './generic/getTimeLive';
import assetDifference from './generic/assetDifference';
import {
  mapBuildTransactionInfo,
  mapTransactionListInfo,
} from './mappers/mapTransactionInfo';
import { mapTransactionListDashboard } from './mappers/mapDashboardInvestor';
import { mapWalletDataDashboardInvestor } from './mappers/mapWalletDataDashboardInvestor';
import { mapDashboardProject } from './mappers/mapDashboardProject';
import WalletContext from './context/wallet-context';
import { WalletContextProvider } from './context/wallet-context';
import { useEpayco } from './hooks/useEpayco';


export {
  getActualPeriod,
  getTTLDate,
  getDateFromTimeStamp,
  mapBuildTransactionInfo,
  mapTransactionListInfo,
  mapDashboardProject,
  mapWalletDataDashboardInvestor,
  mapTransactionListDashboard,
  hexToText,
  getTimeLive,
  useEpayco,
  assetDifference,
  colorByLetter,
  WalletContext,
  WalletContextProvider,
};
