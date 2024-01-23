import { signOut } from 'aws-amplify/auth';
import { Button } from 'flowbite-react';
import Link from 'next/link';
import { CardanoWallet } from '../ui-lib';

interface NavbarProps {
  user: any;
}
const NavbarLanding = (props: NavbarProps) => {
  const { user } = props;
  return (
    <nav className="flex items-center fixed top-0 py-2 gap-2 w-full justify-end pr-4 z-10">
      {user && <p className="text-white">{user.username}</p>}
      {user ? (
        <Button onClick={() => signOut()}>Cerrar sesión</Button>
      ) : (
        <Link href={'/auth/login'}>
          <Button>Ingresar</Button>
        </Link>
      )}
      <CardanoWallet />
    </nav>
  );
};

export default NavbarLanding;
