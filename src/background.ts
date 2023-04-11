import fs from 'fs'
import { ethers } from 'ethers'
import { db, runDbMigration, removeExpiredOrders } from './db'
import type { EventLogs } from './types'

let iFace: ethers.utils.Interface

async function updateOrderFilled(orderHash: string, filled: string) {
  console.log(`New swap! orderHash: ${orderHash}, filled: ${filled}`)
  await db.query(
    `
    UPDATE
      orders
    SET
      filled = filled + $1
    WHERE
      hash = $2
    ;`,
    [filled, orderHash.toLowerCase()]
  )
}

async function updateOrderCanceled(orderHash: string) {
  console.log(`Order canceld. orderHash: ${orderHash}`)
  await db.query(
    `
    DELETE FROM
      orders
    WHERE
      hash = $1
    ;`,
    [orderHash.toLowerCase()]
  )
}

async function getFilterId(
  provider: ethers.providers.JsonRpcProvider,
  chainId: number,
  exchangeAddress: string
): Promise<string> {
  let newFilter: string | undefined
  while (newFilter == undefined) {
    try {
      const latestBlocknumber: number = await provider.getBlockNumber()
      const fromBlock: number = latestBlocknumber - 4_999
      newFilter = await provider.send('eth_newFilter', [
        {
          fromBlock: `0x${fromBlock.toString(16)}`,
          address: [exchangeAddress],
          topics: [
            [
              iFace.getEventTopic('OrderStatus'),
              iFace.getEventTopic('CancelOrder'),
            ],
          ],
        },
      ])
    } catch (err: any) {
      console.log(`Failed to setup new filter for ${chainId} - ${err.body}`)

      // wait for node to reconnect
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return newFilter
}

async function fetchNewLogs(
  provider: ethers.providers.JsonRpcProvider,
  chainId: number,
  filterId: string
) {
  let logs: EventLogs[] = []
  try {
    logs = await provider.send('eth_getFilterChanges', [filterId])
  } catch (err: any) {
    throw new Error(
      `Error sending eth_getFilterChanges for ${chainId}, updating filter - ${err.body}`
    )
  }

  const promise = logs.map(async (log: EventLogs) => {
    try {
      if (log.removed) return

      const parsedData = iFace.parseLog({
        topics: log.topics,
        data: log.data,
      })

      if (parsedData.name === 'CancelOrder') {
        const [orderHash] = parsedData.args as [string]
        await updateOrderCanceled(orderHash)
        console.log(`${chainId}:${orderHash} canceld`)
      } else if (parsedData.name === 'OrderStatus') {
        const [orderHash, filled, remaining] = parsedData.args as [
          string,
          ethers.BigNumber,
          ethers.BigNumber
        ]

        await updateOrderFilled(orderHash, filled.toString())
        console.log(`${chainId}:${orderHash} filled`)
      }
    } catch (err: any) {
      throw new Error(`Error handling new logs for ${chainId} - ${err}`)
    }
  })
  await Promise.all(promise)
}

async function startFilters(chainId: number, exchangeAddress: string) {
  const provider = new ethers.providers.JsonRpcBatchProvider(
    process.env.RPC_ARBITRUM
  )

  let filterId: string = await getFilterId(provider, chainId, exchangeAddress)

  setInterval(async () => {
    try {
      await fetchNewLogs(provider, chainId, filterId)
    } catch (err: any) {
      console.warn(err.message)
      filterId = await getFilterId(provider, chainId, exchangeAddress)
    }
  }, 500)
}

async function start() {
  console.log('background.ts: Starting')
  await runDbMigration()

  const EVMConfig = JSON.parse(fs.readFileSync('EVMConfig.json', 'utf8'))
  const exchangeAbi = JSON.parse(
    fs.readFileSync('abi/ZigZagExchange.json', 'utf8')
  ).abi
  iFace = new ethers.utils.Interface(exchangeAbi)

  try {
    await startFilters(42161, EVMConfig.onChainSettings.exchangeAddress)
    await startFilters(42161, EVMConfig.onChainSettings.exchangeAddress)
  } catch (err: any) {
    console.error(`background - Failed to set up event listener`, err)
  }

  setInterval(removeExpiredOrders, 500)
}

start()
