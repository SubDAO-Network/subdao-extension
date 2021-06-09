/**
 * Important notes on HMR for plugin services
 *
 * createPluginMessage and createPluginRPC supports HMR out of the box.
 * So if you only use these two things, please add the following code to enable HMR.
 *
 * if (module.hot) module.hot.accept()
 */

// Please make sure you have registered your plugin UI at ./PluginUI
import './Wallet/messages'
import './RedPacket/messages'
import './Polls/utils'
