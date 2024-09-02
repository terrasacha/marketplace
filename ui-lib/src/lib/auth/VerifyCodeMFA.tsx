import { confirmSignIn, verifyTOTPSetup, ConfirmSignInInput } from "aws-amplify/auth"
import { useState } from 'react';

const VerifyCodeMFA = (props: any) => {
    const [code, setCode] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCode(event.target.value);
    };
    const verifyMFA = async (codeMFA: string) =>{
        try {
            const result = await verifyTOTPSetup({code: codeMFA})
            console.log(result)
        } catch (error) {
            console.log(error, '16')
        }
    }
    return (
        <div>
            <input
                type="text"
                value={code}
                onChange={handleInputChange}
                placeholder="Enter code"
            />
            <button onClick={() => verifyMFA(code)} className='py-2 px-8 bg-slate-300 hover:bg-slate-400 rounded-md'>Verify</button>
        </div>
    );
};

export default VerifyCodeMFA;
