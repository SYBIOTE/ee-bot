import { MathUtils, Quaternion, Vector3 } from 'three'

import { iterativeMapToObject } from '@etherealengine/common/src/utils/mapToObject'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState, getEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

import { BotHooks, XRBotHooks } from '../enums/BotHooks'
import {
  getXRInputPosition,
  moveControllerStick,
  overrideXR,
  pressControllerButton,
  setXRInputPosition,
  startXR,
  tweenXRInputSource,
  updateController,
  updateHead,
  xrInitialized,
  xrSupported
} from './xrBotHookFunctions'
import { getMutableState } from '@etherealengine/hyperflux'

export const BotHookFunctions = {
  [BotHooks.LocationLoaded]: locationLoaded,
  [BotHooks.SceneLoaded]: sceneLoaded,
  [BotHooks.GetPlayerPosition]: getPlayerPosition,
  [BotHooks.RotatePlayer]: rotatePlayer,
  [BotHooks.GetWorldNetworkPeers]: getPeers,
  [BotHooks.SerializeEngine]: serializeEngine,
  [XRBotHooks.OverrideXR]: overrideXR,
  [XRBotHooks.XRSupported]: xrSupported,
  [XRBotHooks.XRInitialized]: xrInitialized,
  [XRBotHooks.StartXR]: startXR,
  [XRBotHooks.UpdateHead]: updateHead,
  [XRBotHooks.UpdateController]: updateController,
  [XRBotHooks.PressControllerButton]: pressControllerButton,
  [XRBotHooks.MoveControllerStick]: moveControllerStick,
  [XRBotHooks.GetXRInputPosition]: getXRInputPosition,
  [XRBotHooks.SetXRInputPosition]: setXRInputPosition,
  [XRBotHooks.TweenXRInputSource]: tweenXRInputSource
}

// === ENGINE === //

export function locationLoaded() {
  return getEngineState().joinedWorld.value
}

export function sceneLoaded() {
  return getEngineState().sceneLoaded.value
}

export function getPlayerPosition() {
  return getComponent(Engine.instance.localClientEntity, TransformComponent)?.position
}

/**
 * @param {object} args
 * @param {number} args.angle in degrees
 */
export function rotatePlayer({ angle }) {
  const transform = getComponent(Engine.instance.localClientEntity, TransformComponent)
  transform.rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(angle)))
}

export function getPeers() {
  return Array.from(Engine.instance.worldNetwork.peers)
}

export function serializeEngine() {
  const engine = {
    tickRate: Engine.instance.tickRate,
    userId: Engine.instance.userId,
    store: Engine.instance.store,
    frameTime: Engine.instance.frameTime,
    engineTimer: Engine.instance.engineTimer,
    isBot: getMutableState(EngineState).isBot.value,
    // currentScene: Engine.instance.currentScene,
    // worlds: Engine.instance.worlds,
    publicPath: Engine.instance.publicPath,
    xrFrame: Engine.instance.xrFrame,
    isEditor: Engine.instance.isEditor
  }

  console.log(JSON.stringify(iterativeMapToObject(engine)))
  return JSON.stringify(iterativeMapToObject(engine))
}
