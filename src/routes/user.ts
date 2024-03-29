import type { ZZHttpServer } from '../types'
import { db } from '../db'

export default function orderRoutes(app: ZZHttpServer) {
  app.get('/v1/user', async (req, res, next) => {
    if (!req.query.address) return next('Missing query arg address')
    const userAddress = (req.query.address as string).toLowerCase()

    const values = [userAddress, (Date.now() / 1000 | 0) + 1]
    let select;
    try {
      select = await db.query(
        `SELECT 
          hash,
          user_address,
          buy_token,
          sell_token,
          CAST(buy_amount AS TEXT) AS buyamount,
          CAST(sell_amount AS TEXT) AS sellamount,
          CAST(filled AS TEXT) AS filledamount,
          expires,
          sig 
        FROM 
          orders 
        WHERE 
          buy_token=ANY($1) AND 
          sell_token= ANY($2) AND 
          expires >= $3 AND 
          expires <= $4
        ;`,
        values
      )
    } catch (e: any) {
      console.error(e);
      return next(e.detail);
    }

    const orders = select.rows.map((row) => ({
      hash: row.hash,
      order: {
        user: row.user_address,
        buyToken: row.buy_token,
        sellToken: row.sell_token,
        buyAmount: row.buyamount,
        sellAmount: row.sellamount,
        fillAmount: row.filledamount,
        expirationTimeSeconds: row.expires.toString(),
      },
      signature: row.sig,
    }))

    return res.status(200).json({ orders })
  })
}
