/**
 * p2pDataChannel.js
 * Handles WebRTC Data Channel for file transfer
 */
import { createStreamLogger } from '../../streaming/lib/streamLogger'

const log = createStreamLogger('nexusP2P')

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
}

const CHUNK_SIZE = 64 * 1024 // 64KB

export function createNexusPeer({ onOffer, onAnswer, onIceCandidate, onStatusChange, onProgress, onDataChannelOpen }) {
  let pc = new RTCPeerConnection(ICE_CONFIG)
  let dataChannel = null
  let receiveBuffer = []
  let receivedSize = 0
  let expectedSize = 0
  let currentFileMeta = null
  let isSender = false
  
  pc.onicecandidate = (e) => {
    if (e.candidate) onIceCandidate(e.candidate)
  }

  pc.onconnectionstatechange = () => {
    log.info('P2P State:', pc.connectionState)
    onStatusChange?.(pc.connectionState)
  }

  // Set up Data Channel for receiving
  pc.ondatachannel = (event) => {
    dataChannel = event.channel
    dataChannel.binaryType = 'arraybuffer'
    setupDataChannelHandlers(dataChannel)
    if (dataChannel.readyState === 'open') {
      onDataChannelOpen?.()
    } else {
      dataChannel.onopen = () => {
        onDataChannelOpen?.()
      }
    }
  }

  function setupDataChannelHandlers(channel) {
    channel.onmessage = (e) => {
      if (typeof e.data === 'string') {
        const msg = JSON.parse(e.data)
        if (msg.type === 'FILE_META') {
          currentFileMeta = msg.meta
          expectedSize = currentFileMeta.size
          receiveBuffer = []
          receivedSize = 0
          log.info('Receiving file:', currentFileMeta.name)
        } else if (msg.type === 'FILE_DONE') {
          const blob = new Blob(receiveBuffer, { type: currentFileMeta.type })
          const url = URL.createObjectURL(blob)
          // Trigger download
          const a = document.createElement('a')
          a.href = url
          a.download = currentFileMeta.name
          a.click()
          URL.revokeObjectURL(url)
          log.info('File download complete:', currentFileMeta.name)
          onProgress?.(100)
        }
      } else {
        // Binary chunk
        receiveBuffer.push(e.data)
        receivedSize += e.data.byteLength
        if (expectedSize > 0) {
           onProgress?.(Math.round((receivedSize / expectedSize) * 100))
        }
      }
    }
  }

  // Initiate connection (Sender)
  async function connect() {
    isSender = true
    dataChannel = pc.createDataChannel('fileTransfer', { ordered: true })
    dataChannel.binaryType = 'arraybuffer'
    dataChannel.bufferedAmountLowThreshold = 65536
    setupDataChannelHandlers(dataChannel)

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    onOffer(pc.localDescription)
  }

  async function handleOffer(sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    onAnswer(pc.localDescription)
  }

  async function handleAnswer(sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
  }

  async function handleIceCandidate(candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate))
  }

  async function sendFile(file) {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      throw new Error('Data channel not open')
    }

    dataChannel.send(JSON.stringify({
      type: 'FILE_META',
      meta: { name: file.name, size: file.size, type: file.type }
    }))

    const reader = file.stream().getReader()
    let sentSize = 0
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        const chunk = value.slice(i, i + CHUNK_SIZE)
        
        // Wait if buffer is full
        while (dataChannel.bufferedAmount > dataChannel.bufferedAmountLowThreshold) {
          await new Promise(r => setTimeout(r, 10))
        }
        
        dataChannel.send(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength))
        sentSize += chunk.byteLength
        onProgress?.(Math.round((sentSize / file.size) * 100))
      }
    }

    dataChannel.send(JSON.stringify({ type: 'FILE_DONE' }))
  }

  function close() {
    if (dataChannel) dataChannel.close()
    pc.close()
  }

  return {
    connect,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    sendFile,
    close
  }
}
