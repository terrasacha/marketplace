import CardanoWallet from '../cardano-wallet/CardanoWallet';
import WelcomeCard from './WelcomeCard';
import Image from 'next/image';
const Login = (props: any) => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_login.jpg"
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <div className="fixed top-1 w-full flex justify-end pr-4 z-10">
        <CardanoWallet />I
      </div>
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        <WelcomeCard checkingWallet={props.checkingWallet} />
      </div>
    </div>
  );
};

export default Login;
