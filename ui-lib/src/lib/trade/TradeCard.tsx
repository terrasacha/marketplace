import { useContext, useEffect, useState } from 'react';
import Card from '../common/Card';
import CreateOrderCard from '../trade/CreateOrderCard';
import OrderBookCard from '../trade/OrderBookCard';
import { WalletContext } from '@marketplaces/utils-2';
import { OrderHistoryCard } from '../ui-lib';

export default function TradeCard(props: any) {
  const { walletID, walletData } = useContext<any>(WalletContext);

  const [activeTab, setActiveTab] = useState<string>('my_orders');
  const [orderList, setOrderList] = useState<Array<any> | null>(null);
  const [orderHistoryList, setOrderHistoryList] = useState<Array<any> | null>(
    null
  );
  const [userOrdersList, setUserOrdersList] = useState<Array<any> | null>(null);

  const paginationLimit = 5;

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const getOrderList = async () => {
    const params = {
      walletAddress: '',
      paginationLimit: String(paginationLimit),
      nextToken: '',
    };
    const queryParams = new URLSearchParams(params).toString();
    const request = await fetch(`/api/calls/getOrders?${queryParams}`);

    const orders = await request.json();
    console.log('orders', orders);
    setOrderList(orders.items);
  };

  const getOrderHistoryList = async () => {
    const request = await fetch(
      `/api/calls/getOrders?walletAddress=${walletData.address}?limit=${paginationLimit}?nextToken=`
    );

    const ordersHistory = await request.json();
    setOrderHistoryList(ordersHistory.items);
  };

  const getUserOrdersList = async () => {
    const request = await fetch(
      `/api/calls/getOrders?walletAddress=${walletData.address}?limit=${paginationLimit}?nextToken=`
    );

    const ordersHistory = await request.json();
    setUserOrdersList(ordersHistory.items);
  };

  useEffect(() => {
    getOrderList();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-3 xl:col-span-1">
        <CreateOrderCard
          walletId={walletID}
          userAssetList={walletData.assets}
          walletAddress={walletData.address}
          walletStakeAddress={walletData.stake_address}
          getOrderList={getOrderList}
        />
      </div>
      <div className="col-span-3 xl:col-span-2">
        <OrderBookCard
          walletAddress={walletData.address}
          walletId={walletID}
          orderList={orderList}
        />
      </div>
      <div className="col-span-3">
        <OrderHistoryCard />
      </div>
    </div>
  );
}
