#!/usr/bin/env node
// SPDX-License-Identifier: BUSL-1.1

import dotenv from 'dotenv'
dotenv.config()

import compression from 'compression'
import express from 'express'
import { createServer } from 'http'
import infoRoutes from './routes/info'
import orderRoutes from './routes/order'
import userRoutes from './routes/user'

const expressApp = express()
const server = createServer(expressApp)

expressApp.use(express.json())
expressApp.use(compression())

// CORS
expressApp.use('/', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  next()
})

// Log Requests
expressApp.use((req, res, next) => {
  console.log(req.method, req.url, req.body, req.headers.origin)
  next()
})

// Register routes
orderRoutes(expressApp)
infoRoutes(expressApp)
userRoutes(expressApp)

// Universal error handler
expressApp.use((err, req, res, next) => {
  console.error('ERROR:', req.method, req.url, err)
  res.status(400).json({ err: err })
})

export default expressApp
