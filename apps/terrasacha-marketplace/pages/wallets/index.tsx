import { MyPage } from '@terrasacha/components/common/types';
import Landing from '@terrasacha/components/landing/Landing';

const WalletsPage: MyPage = (props: any) => {
  return <Landing loading={false} />;
};

export default WalletsPage;
WalletsPage.Layout = 'NoLayout';

