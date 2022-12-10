// SPDX-License-Identifier: BUSL-1.1
import type { Application } from 'express'

export type AnyObject = { [key: string | number]: any }

export type ZZHttpServer = Application

export type zzErrorMessage = {
  op: 'error'
  args: string
}

export type ZZMessage = {
  op: string
  args: any
}

export type ZZTokenInfo = {
  address: string,
  symbol: string,
  decimals: number,
  name: string
}

export type ZZMarketInfo = {
  buyTokenInfo: ZZTokenInfo,
  sellTokenInfo: ZZTokenInfo,
  exchangeAddress: string,
  contractVersion: string
}

export type ZZOrder = {
  user: string
  sellToken: string
  buyToken: string
  sellAmount: number
  buyAmount: number
  expirationTimeSeconds: string
  signature?: string
  orderId?: number,
  unfilled?: number
  sellAmountParsed?: string
  buyAmountParsed?: string
}