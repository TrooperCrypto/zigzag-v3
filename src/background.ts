import fs from 'fs'
import { ethers } from 'ethers'
import { db, runDbMigration, removeExpiredOrders } from './db'

/*
async function updateOrderFilled(orderHash: string, makerSellAmount: string, ) {
  await db.query(`
    UPDATE
      orders
    SET
      filled = filled + $1
    WHERE
      hash = $2
    ;`,
    [makerSellAmount, orderHash]
  )
}
*/

async function updateOrderCanceled(orderHash: string) {
  console.log(`Order canceld. orderHash: ${orderHash}`)
  await db.query(`
    DELETE FROM
      orders
    WHERE
      hash = $1
    ;`,
    [orderHash]
  )
}

async function startListeners(contract: ethers.Contract) {
  /*
  contract.on(
    'Swap',
    (
      maker: string,
      makerOrderHash: string,
      taker: string,
      makerSellToken: string,
      takerSellToken: string,
      makerSellAmount: ethers.BigNumber,
      takerSellAmount: ethers.BigNumber,
      makerVolumeFee: ethers.BigNumber,
      takerVolumeFee: ethers.BigNumber,
      blockData: any
    ) => {
      console.log(`New swap! maker: ${maker}, makerSellToken: ${makerSellToken}, makerBuyToken: ${takerSellToken}, makerSellAmount: ${makerSellAmount}, makerBuyAmount: ${takerSellAmount}`)
      updateOrderFilled(makerOrderHash, makerSellAmount, takerSellAmount)
        .catch((err: any) => {
          console.log(`Failed to handle 'Swap' ${err}`)
          console.log(err)
        })
    }
  )
  */

  contract.on(
    'CancelOrder',
    (
      orderHash: string,
      blockData: any
    ) => {
      updateOrderCanceled(orderHash)
        .catch((err: any) => {
          console.log(`Failed to handle 'Swap' ${err}`)
          console.log(err)
        })
    }
  )  
}

async function start() {
  console.log('background.ts: Starting')
  await runDbMigration()

  const exchangeAbi = JSON.parse(fs.readFileSync('abi/ZigZagExchange.json', 'utf8')).abi
  const EVMConfig = JSON.parse(fs.readFileSync('EVMConfig.json', 'utf8'))

  const provider = new ethers.providers.JsonRpcBatchProvider(process.env.INFURA_ARBITRUM)
  const contract = new ethers.Contract(EVMConfig.onChainSettings.exchangeAddress, exchangeAbi, provider)
  await startListeners(contract)

  setInterval(removeExpiredOrders, 2 * 1000)
}

start()
