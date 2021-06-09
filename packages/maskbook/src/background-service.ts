//#region Polyfills
import 'webpack-target-webextension/lib/background' // Dynamic import and chunk splitting
import './polyfill'
// @ts-ignore WebCrypto
import { crypto } from 'webcrypto-liner/build/index.es'
Object.defineProperty(globalThis, 'crypto', { configurable: true, enumerable: true, get: () => crypto })
//#endregion

import './extension/service' // setup Services.*
import './utils/native-rpc' // setup Android and iOS API server
import './social-network-adaptor' // setup social network providers
import './extension/background-script/Jobs' // start jobs
import './plugins/PluginSerivce' // setup plugins
import './utils/debug/general'

import keyring from '@polkadot/ui-keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ss58Format, keypairType } from './polkadot/constants'
cryptoWaitReady()
    .then(() => {
        keyring.loadAll({ ss58Format, type: keypairType })

        console.log('polkadot cryptoWaitReady initialization completed')
    })
    .catch((error): void => {
        console.error('polkadot cryptoWaitReady initialization failed', error)
    })
