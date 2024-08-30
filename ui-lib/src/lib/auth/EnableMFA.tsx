import { useQRCode } from 'next-qrcode';
import { useState, useEffect } from 'react';
import { getCurrentUser, setUpTOTP, updateUserAttribute, verifyTOTPSetup, updateMFAPreference } from 'aws-amplify/auth';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
const EnableMFA = (props : any) =>{
  const router = useRouter()
  const { Canvas } = useQRCode();
  const [setupMFA, setSetupMFA] = useState<any>('')
  const [checkLoading, setCheckLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [code, setCode] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCode(event.target.value);
    };
    async function handleTOTPVerification() {
      setCheckLoading(true)
      try {
        await verifyTOTPSetup({ code: code });
        toast.success('Código válido');
      } catch (error : any) {
        const errorString = error.toString();
        if(errorString.includes("Code mismatch")){
          toast.error('Código inválido');
        }else if (errorString.includes("failed to satisfy constraint")){
          toast.error('El código no cumple la condición de tener una longitud de 6 caracteres');
        }
      } finally {

        setCheckLoading(false)
      }
    }
  async function handleTOTPSetup() {
    try {
      const totpSetupDetails = await setUpTOTP();
      const appName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'app_name';
      const setupUri = totpSetupDetails.getSetupUri(appName);
      setSetupMFA(setupUri)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() =>{
    handleTOTPSetup()
  },[])
  async function handleUpdateMFAPreference() {
    setSaveLoading(true)
    try {
      await updateMFAPreference({ totp: 'ENABLED' });
      await updateUserAttribute({ userAttribute: { attributeKey: 'custom:setMFA', value:'true'}})
      return router.reload()
    } catch (error) {
      console.log(error);
    } finally {
      setSaveLoading(false)
    }
  }
    return(
        <div className='bg-white rounded-2xl w-[45rem] max-w-[45rem] 2xl:w-[45%] py-10 px-10 sm:px-10 h-auto flex flex-col justify-center'>
          <div>
            <h1 className="font-jostBold text-3xl font-jostBold pb-3 text-center">Multi-factor Authentication</h1>
            <p className='pb-1 text-center'>Lee el QR con tu dispositivo móvil</p>
          </div>
          <div className='flex p-6'>
          <div className='w-[70%] flex justify-center'>
            {setupMFA ?<Canvas
            text={`${setupMFA}` || 'loading'}
            options={{
              errorCorrectionLevel: 'M',
              margin: 5,
              scale: 6,
              width: 300,
              color: {
                dark: '#1e293b',
                light: '#fff',
              },
            }}
          />  :
          <div>
            <TailSpin width={30}/>  
          </div>}         
          </div>
          <div className='flex flex-col w-full justify-center'>
            <input
                  type="text"
                  className=''
                  value={code}
                  onChange={handleInputChange}
                  placeholder="Ingresa el código MFA"
              />
              <button className="relative w-full mt-6 flex items-center h-10 justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2"
              onClick={() => handleTOTPVerification()}>
                {checkLoading?
                <TailSpin 
                  width="20"
                  color="#fff"
                  wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                /> :
                'Checkear'}
              </button>
            <button className="relative w-full mt-6 flex items-center h-10 justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2"
              onClick={() => handleUpdateMFAPreference()}>
                {saveLoading?
                <TailSpin 
                  width="20"
                  color="#fff"
                  wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                /> :
                'Guardar'}
              </button>
          </div>
          </div>
        </div>
    )
}

export default EnableMFA