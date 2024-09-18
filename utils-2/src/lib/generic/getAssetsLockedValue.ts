type Token = {
  policy_id: string;
  asset_name: string;
  quantity: string;
};

type TokenGroup = {
  policyid: string;
  tokens: { [asset_name: string]: number };
};

type Payload = {
  address: string;
  lovelace: number;
  multiAsset: TokenGroup[];
};

export type MinLovelaceResponse = number | null

function groupTokensByPolicyId(tokens: Token[]): TokenGroup[] {
  const policyMap: { [policy_id: string]: TokenGroup } = {};

  tokens.forEach(({ policy_id, asset_name, quantity }) => {
    if (!policyMap[policy_id]) {
      policyMap[policy_id] = { policyid: policy_id, tokens: {} };
    }

    policyMap[policy_id].tokens[asset_name] = parseInt(quantity, 10);
  });

  return Object.values(policyMap);
}

export default async function getAssetsLockedValue(
  address: string,
  assets: Token[]
): Promise<MinLovelaceResponse> {
  try {
    const payload: Payload = {
      address: address,
      lovelace: 0,
      multiAsset: groupTokensByPolicyId(assets),
    };

    const request = await fetch('/api/helpers/min-lovelace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!request.ok) {
      throw new Error(`Error fetching min lovelace value: ${request.statusText}`);
    }

    const minLovelaceValue: MinLovelaceResponse = await request.json();
    return minLovelaceValue;
  } catch (error) {
    console.error('Error in getAssetsLockedValue:', error);
    return null;
  }
}
