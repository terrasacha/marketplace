import { useContext, useEffect, useState } from 'react';
import CreateOrderCard from '../trade/CreateOrderCard';
import OrderBookCard from '../trade/OrderBookCard';
import { WalletContext } from '@marketplaces/utils-2';
import { AssetModal, OrderHistoryCard } from '../ui-lib';

export default function TradeCard(props: any) {
  const { walletID, walletData } = useContext<any>(WalletContext);

  console.log('walletData', walletData);

  const [activeTab, setActiveTab] = useState<string>('my_orders');
  const [orderList, setOrderList] = useState<Array<any>>([]);
  const [orderHistoryList, setOrderHistoryList] = useState<Array<any> | null>(
    null
  );
  const [userOrderList, setUserOrderList] = useState<Array<any>>([]);
  const [purchaseList, setPurchaseList] = useState<Array<any>>([]);
  const [suanUserTokens, setSuanUserTokens] = useState<Array<any>>([]);
  const [spendSwapId, setSpendSwapId] = useState<string>('');
  const [spendSwapAddress, setSpendSwapAddress] = useState<string>('');

  const paginationLimit = 1;

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const getSpendSwapId = async () => {
      const request = await fetch('/api/contracts/get-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const scriptList = await request.json();

      const spendSwapId =
        scriptList.find((script: any) => script.script_type === 'spendSwap')
          ?.id || '';

      const spendSwapAddress =
        scriptList.find((script: any) => script.script_type === 'spendSwap')
          ?.testnetAddr || '';
      console.log('spendSwap', spendSwapId);

      setSpendSwapId(spendSwapId);
      setSpendSwapAddress(spendSwapAddress);
    };

    getSpendSwapId();
  }, []);

  const getOrderList = async (nextToken = '') => {
    const params = {
      walletId: '',
      paginationLimit: String(paginationLimit),
      filterByStatusCode: 'listed',
      nextToken: nextToken,
    };
    const queryParams = new URLSearchParams(params).toString();
    console.log(`/api/calls/getOrders?${queryParams}`);
    const request = await fetch(`/api/calls/getOrders?${queryParams}`);
    const orders = await request.json();

    console.log('orders', orders);
    setOrderList(Array.isArray(orders) ? orders : []);
  };

  const getUserOrderList = async () => {
    const params = {
      walletId: walletID,
      paginationLimit: String(paginationLimit),
      nextToken: '',
    };
    const queryParams = new URLSearchParams(params).toString();
    console.log(`/api/calls/getOrders?${queryParams}`);
    const request = await fetch(`/api/calls/getOrders?${queryParams}`);

    const ordersHistory = await request.json();
    setUserOrderList(Array.isArray(ordersHistory) ? ordersHistory : []);
  };

  const getPurchaseList = async () => {
    const params = {
      walletId: '',
      paginationLimit: String(paginationLimit),
      filterByStatusCode: 'claimed',
      nextToken: '',
    };
    const queryParams = new URLSearchParams(params).toString();
    console.log(`/api/calls/getOrders?${queryParams}`);
    const request = await fetch(`/api/calls/getOrders?${queryParams}`);

    const purchaseHistory = await request.json();
    const purchaseHistoryFiltered = Array.isArray(purchaseHistory)
      ? purchaseHistory.filter(
          (purchase: any) => purchase.walletBuyerID === walletID
        )
      : [];
    setPurchaseList(purchaseHistoryFiltered);
  };

  const getSuanTokens = async () => {
    const request = await fetch(`/api/calls/backend/listTokens`);
    const suanTokens = await request.json();

    // Validar que suanTokens y walletData?.assets sean arrays
    if (!Array.isArray(suanTokens) || !Array.isArray(walletData?.assets)) {
      setSuanUserTokens([]);
      return;
    }

    // const filteredSuanProjectsTokenList = walletData.assets.filter((asset: any) => asset.asset_name === suanTokens)
    const filteredSuanProjectsTokenList = walletData.assets
      .filter((item1: any) => {
        return suanTokens.some(
          (item2: any) =>
            item1.policy_id === item2.policyID &&
            item1.asset_name === item2.tokenName
        );
      })
      .map((item1: any) => {
        const match = suanTokens.find(
          (item2: any) =>
            item1.policy_id === item2.policyID &&
            item1.asset_name === item2.tokenName
        );
        return {
          ...item1,
          ...match,
        };
      });
    setSuanUserTokens(filteredSuanProjectsTokenList);
  };

  useEffect(() => {
    if (walletData) {
      getOrderList();
      getUserOrderList();
      getPurchaseList();
      getSuanTokens();
    }
  }, [walletData]);

  // Calcular estadísticas rápidas
  const totalOrders = orderList.length;
  const myActiveOrders = userOrderList.filter((order: any) => order.statusCode === 'listed').length;
  const totalPurchases = purchaseList.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-custom-marca-boton/10 via-custom-marca-boton-alterno2/5 to-white rounded-xl p-5 border border-custom-marca-boton/20 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-jostRegular text-gray-600 mb-1">Órdenes Disponibles</p>
              <p className="text-3xl font-jostBold bg-gradient-to-r from-custom-marca-boton to-custom-marca-boton-variante bg-clip-text text-transparent">
                {totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-custom-marca-boton to-custom-marca-boton-variante rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-custom-marca-boton-alterno/10 via-custom-marca-boton-alterno2/5 to-white rounded-xl p-5 border border-custom-marca-boton-alterno/20 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-jostRegular text-gray-600 mb-1">Mis Órdenes Activas</p>
              <p className="text-3xl font-jostBold bg-gradient-to-r from-custom-marca-boton-alterno to-custom-marca-boton-alterno2 bg-clip-text text-transparent">
                {myActiveOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-custom-marca-boton-alterno to-custom-marca-boton-alterno2 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/10 via-yellow-400/5 to-white rounded-xl p-5 border border-yellow-500/20 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-jostRegular text-gray-600 mb-1">Compras Realizadas</p>
              <p className="text-3xl font-jostBold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                {totalPurchases}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal mejorado */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Panel de crear orden - Sticky en desktop */}
        <div className="xl:col-span-1">
          <div className="xl:sticky xl:top-6">
            <CreateOrderCard
              walletId={walletID}
              userAssetList={suanUserTokens}
              walletAddress={walletData?.address}
              walletStakeAddress={walletData?.stake_address}
              getOrderList={getOrderList}
              spendSwapId={spendSwapId}
              spendSwapAddress={spendSwapAddress}
            />
          </div>
        </div>
        
        {/* Panel de órdenes disponibles */}
        <div className="xl:col-span-2">
          <OrderBookCard
            walletAddress={walletData?.address}
            walletId={walletID}
            orderList={orderList}
            itemsPerPage={5}
            spendSwapId={spendSwapId}
            spendSwapAddress={spendSwapAddress}
          />
        </div>
      </div>
      
      {/* Historial de órdenes */}
      <div>
        <OrderHistoryCard
          userOrderList={userOrderList}
          purchaseList={purchaseList}
          itemsPerPage={5}
          walletAddress={walletData?.address}
          walletId={walletID}
          spendSwapId={spendSwapId}
          spendSwapAddress={spendSwapAddress}
        />
      </div>
    </div>
  );
}
