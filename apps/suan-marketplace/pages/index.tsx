import React, { useContext, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
const Landing = dynamic(() => import('@suan/components/landing/Landing'))
import LoginFromContext from '@suan/store/login-from'
import { useWallet, useAssets } from '@meshsdk/react'
import { useRouter } from 'next/router'
import { MyPage } from '@suan/components/common/types'
import { getCurrentUser } from 'aws-amplify/auth'
const LandingPage: MyPage = (props: any) => {
  const { connected } = useWallet()
  const [checkingWallet, setCheckingWallet] = useState<string>('uncheck')
  const [loading, setLoading] = useState<boolean>(true)
  const [walletcount, setWalletcount] = useState<number>(0)
  const router = useRouter()
  const { handleLoginFrom } = useContext<any>(LoginFromContext)
  const assets = useAssets() as Array<{ [key: string]: any }>

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true)
            // Access home with wallet
            const walletAccessResponse = await accessHomeWithWallet()

            if (walletAccessResponse) {
                // Fetch wallet by user
                const walletFetchResponse = await fetch('/api/calls/backend/getWalletByUser', {
                    method: 'POST',
                    body: walletAccessResponse,
                })

                const walletData = await walletFetchResponse.json()

                if (walletData && walletData.length > 0) {
                    const walletAddress = walletData[0].address

                    // Fetch wallet balance by address
                    const balanceFetchResponse = await fetch('/api/calls/backend/getWalletBalanceByAddress', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(walletAddress),
                    })

                    const balanceData = await balanceFetchResponse.json()

                    if (balanceData && balanceData.length > 0 && balanceData[0].balance > 0) {
                        const hasTokenAuth = balanceData[0].assets.some((asset: any) => asset.policyId === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
                            asset.assetName === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME)

                        if (hasTokenAuth) {
                            console.log('hasTokenAuth')
                            setCheckingWallet('hasTokenAuth')
                        } else {
                            console.log('requestToken')
                            setCheckingWallet('requestToken')
                        }
                    } else {
                        console.log('notBalance')
                        setCheckingWallet('notBalance') //la billetera no tiene balance, FONDEAR
                    }

                    setWalletcount(walletData.length)
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    fetchData()
}, [])

  const accessHomeWithWallet = async () => {
    try {
      const user = await getCurrentUser()
      return user.userId
    } catch {
      return false
    }
  }
  const handleSetCheckingWallet = (data : string) => {
    setCheckingWallet(data)
  }
  useEffect(() => {
    if (connected) {
      console.log('connected2')
      setCheckingWallet('checking')
      const matchingAsset =
        assets &&
        assets.filter(
          (asset) =>
            asset.policyId === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
            asset.assetName === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME
        )
      if (matchingAsset !== undefined) {
        if (matchingAsset.length > 0) {
          console.log('hasTokenAuth')
                            setCheckingWallet('hasTokenAuth')
        } else {
          console.log('requestToken')
                            setCheckingWallet('requestToken')
        }
        setWalletcount(1)
      }
      
    } else {
      setCheckingWallet('uncheck')
    }
  }, [connected, assets])

  return (
    <>
      <Landing
        checkingWallet={checkingWallet}
        handleSetCheckingWallet={handleSetCheckingWallet}
        loading={loading}
        walletcount={walletcount}
      />
    </>
  )
}

export default LandingPage
LandingPage.Layout = 'NoLayout'
