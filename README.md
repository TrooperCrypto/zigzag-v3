# ZigZag API

Base URL: https://api.arbitrum.zigzag.exchange

## Table of Contents

* [GET /v1/info](#market-info)
* [GET /v1/orders](#get-orders)
* [POST /v1/order](#submit-order)
* [Filling Orders](#filling-orders)

## Market Info

`GET /v1/info`

```
{
  "markets": [
    {
      "buyToken": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "sellToken": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      "verified": true
    },
    {
      "buyToken": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      "sellToken": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "verified": true
    }
  ],
  "verifiedTokens": [
    {
      "address": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "symbol": "WETH",
      "decimals": 18,
      "name": "Wrapped Ether"
    },
    {
      "address": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      "symbol": "USDC",
      "decimals": 6,
      "name": "USD Coin"
    }
  ],
  "exchange": {
    "exchangeAddress": "0x20e7FCC377CB96805c6Ae8dDE7BB302b344dc42f",
    "domain": {
      "name": "ZigZag",
      "version": "2.1",
      "chainId": "42161",
      "verifyingContract": "0x20e7FCC377CB96805c6Ae8dDE7BB302b344dc42f"
    },
    "types": {
      "Order": [
        { "name": "user", "type": "address" },
        { "name": "sellToken", "type": "address" },
        { "name": "buyToken", "type": "address" },
        { "name": "sellAmount", "type": "uint256" },
        { "name": "buyAmount", "type": "uint256" },
        { "name": "expirationTimeSeconds", "type": "uint256" }
      ]
    }
  }
}
```

## Get Orders

`GET /v1/orders`

**Query paramaters**:

* `buyToken`: Address of token being purchased. Can take multiple comma seperated values.    
* `sellToken`: Address of token being sold. Can take multiple comma seperated values.   
* `minExpires`: (optional) UNIX timestamp of earliest expiry you want to see. Defaults to current time.    
* `maxExpires`: (optional) UNIX timestamp of latest expiry you want to see. Defaults to 60 seconds past the current time.    

**Example:**

`GET /v1/orders?buyToken=0x82af49447d8a07e3bd95bd0d56f35241523fbab1&sellToken=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8`

```
{
  "orders": [
    {
      "hash": "0x731447a4dffa75104b9d9c4502a482565f43babbe462c9767b6e7d8ed0122813",
      "order": {
        "user": "0xc3Be2ecf454A5C74c1218949b4526433a9665fA1",
        "buyToken": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        "sellToken": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        "buyAmount": "1200000000000000000000",
        "sellAmount": "1000000000000000000",
        "expirationTimeSeconds": "1670880795"
      },
      "signature": "0xb95eba788d8cc58a96ef11092fec08d9e4f6bb9eac42d36201d1e8de7ef77c963103d5e04ced61116a0bb302288000265e663dfce60b471727a7bcea8c0904e31c"
    },
    {
      "hash": "0x2515f0d72f267489a77212603e0fbd5527ca42d82af778a4bac36059307beb34",
      "order": {
        "user": "0xc3Be2ecf454A5C74c1218949b4526433a9665fA1",
        "buyToken": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        "sellToken": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        "buyAmount": "1200000000000000000000",
        "sellAmount": "1000000000000000000",
        "expirationTimeSeconds": "1670880796"
      },
      "signature": "0xaf9fef368e180ff6094875d73bc12b6e76d77e9903a787093d06aa2dc68834807d76b17788ebca21ef127ab15e42de6476255c919e840fe5c842cb1aa946c2d51c"
    }
  ]
}
```

**Other Examples:**

`GET /v1/orders?buyToken=0x82af49447d8a07e3bd95bd0d56f35241523fbab1&sellToken=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&maxExpires=1671152930`    
`GET /v1/orders?buyToken=0x82af49447d8a07e3bd95bd0d56f35241523fbab1,0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&sellToken=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8,0x82af49447d8a07e3bd95bd0d56f35241523fbab1`    


## Submit Order

`POST /v1/order`

**POST JSON parameters**

* `order.user`: The address of the user sending the order     
* `order.buyToken`: The address of the token being bought     
* `order.sellToken`: The address of the token being sold     
* `order.buyAmount`: The quantity of buyToken being bought as a uint256 string    
* `order.sellAmount`: The quantity of sellToken being sold as a uint256 string    
* `signature`: Orders must be signed. To generate the signature, use the `domain` and `types` info in `GET /v1/info`, then use something like [ethers.utils.signTypedData](https://docs.ethers.org/v5/api/signer/#Signer-signTypedData) to generate an EIP-712 signature.     
* `signer`: (optional) Most users will not need this. Smart contracts will usually have a designated signer. They can use this field to pass in the address of the authorized signer for signature verification.   

**Example**

```
POST /v1/order
Content-Type: application/json

{
  "order": {
    "user": "0xc3Be2ecf454A5C74c1218949b4526433a9665fA1",
    "buyToken": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "sellToken": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    "buyAmount": "1200000000000000000000",
    "sellAmount": "1000000000000000000",
    "expirationTimeSeconds": "1670797689"
  },
  "signature": "0xe961cf684e0dd4174a0daa48d3d836efed865efebba6a060c080100434eff33e635193154ce4f8857a66068e37eb8c6b92ef65eb4e6c27260034caf58b06c9f61c"
}



200 OK
Access-Control-Allow-Origin: *
Content-Type: application/json

{ hash: "0x7bcad1ceab2751cf380fd000facd079682f95b70a93c1bfbf7230a76fd8eacfc" }
```

## Filling Orders

You can fill orders by submitting them on-chain. 

Our current contract address is viewable in our [config](EVMConfig.json) and you can view the code on [Arbiscan](https://arbiscan.io/address/0x094cAb67fBB074b7797AB0975c69A341b7A40641#code).

To submit an order, we recommend you use the `fillOrderExactInput` and `fillOrderExactOutput` functions. The function signatures look as follows. The order and signature data is available via `GET /v1/orders`.

```
// @notice Fills an order with an exact amount to sell
// @param makerOrder Order that will be used to make this swap
// @param makerSignature  Signature for the order used
// @param takerSellAmount amount send from the sender to the maker
// @return returns true if successfull
function fillOrderExactInput( LibOrder.Order calldata makerOrder, bytes calldata makerSignature, uint takerSellAmount, bool fillAvailable) public returns (bool);

/// @notice Fills an order with an exact amount to buy
/// @param makerOrder Order that will be used to make this swap
/// @param makerSignature  Signature for the order used
/// @param takerBuyAmount amount send to the sender from the maker
/// @param fillAvailable Should the maximum buyAmount possible be used
/// @return returns true if successfull
function fillOrderExactOutput( LibOrder.Order calldata makerOrder, bytes calldata makerSignature, uint takerBuyAmount, bool fillAvailable) public returns (bool);
```

The above functions work for all ERC-20 tokens. If you want to send ETH as your input or receive ETH as your output, use the following similar functions instead. 

```
function fillOrderExactInputETH( LibOrder.Order calldata makerOrder, bytes calldata makerSignature, uint takerSellAmount, bool fillAvailable) public payable returns (bool);

function fillOrderExactOutputETH( LibOrder.Order calldata makerOrder, bytes calldata makerSignature, uint takerBuyAmount, bool fillAvailable) public payable returns (bool);
```

Examples on exact usage are coming soon, but in the meantime, you can hit us up on [Discord](https://discord.gg/zigzag) if you need any help building your bot. 
