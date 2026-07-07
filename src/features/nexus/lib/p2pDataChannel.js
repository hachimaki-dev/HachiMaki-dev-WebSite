/**
 * p2pDataChannel.js
 * Handles WebRTC Data Channel for file transfer
 */
import { createStreamLogger } from '../../streaming/lib/streamLogger'

const log = createStreamLogger('nexusP2P')

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
}

const CHUNK_SIZE = 16 * 1024 // 16KB (Safe Universal MTU for Firefox/Safari compatibility)

export function createNexusPeer({ onOffer, onAnswer, onIceCandidate, onStatusChange, onProgress, onDataChannelOpen }) {
  let pc = new RTCPeerConnection(ICE_CONFIG)
  let dataChannel = null
  let receiveBuffer = []
  let receivedSize = 0
  let expectedSize = 0
  let currentFileMeta = null
  let isSender = false
  let iceCandidateQueue = []
  
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      console.log('[WEB_RTC] Generated ICE candidate:', e.candidate.candidate)
      onIceCandidate(e.candidate)
    } else {
      console.log('[WEB_RTC] ICE gathering complete (null candidate)')
    }
  }

  pc.onicegatheringstatechange = () => {
    console.log('[WEB_RTC] ICE gathering state changed:', pc.iceGatheringState)
  }

  pc.onconnectionstatechange = () => {
    console.log('[WEB_RTC] Connection state changed:', pc.connectionState)
    log.info('P2P State:', pc.connectionState)
    onStatusChange?.(pc.connectionState)
  }

  // Set up Data Channel for receiving
  pc.ondatachannel = (event) => {
    console.log('[WEB_RTC] Received remote DataChannel:', event.channel.label)
    dataChannel = event.channel
    dataChannel.binaryType = 'arraybuffer'
    dataChannel.bufferedAmountLowThreshold = 65536
    setupDataChannelHandlers(dataChannel)
    if (dataChannel.readyState === 'open') {
      console.log('[WEB_RTC] DataChannel already open upon receipt')
      onDataChannelOpen?.()
    } else {
      console.log('[WEB_RTC] DataChannel readyState:', dataChannel.readyState, '- waiting for onopen')
      dataChannel.onopen = () => {
        console.log('[WEB_RTC] DataChannel onopen triggered (Receiver)')
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
          try {
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
          } catch (err) {
            console.error('[WEB_RTC] Out of memory or Blob creation error:', err)
            onStatusChange?.('failed')
          }
        }
      } else {
        // Binary chunk
        try {
          receiveBuffer.push(e.data)
          receivedSize += e.data.byteLength
          if (expectedSize > 0) {
             onProgress?.(Math.round((receivedSize / expectedSize) * 100))
          }
        } catch (err) {
          console.error('[WEB_RTC] Array buffer push error (likely OOM):', err)
          onStatusChange?.('failed')
        }
      }
    }

    channel.onerror = (error) => {
      console.error('[WEB_RTC] DataChannel error:', error)
      log.error('DataChannel error', error)
      onStatusChange?.('failed')
    }

    channel.onclose = () => {
      console.log('[WEB_RTC] DataChannel closed')
      log.info('DataChannel closed')
      if (receivedSize > 0 && expectedSize > 0 && receivedSize < expectedSize) {
        // Closed prematurely
        onStatusChange?.('failed')
      }
    }
  }

  // Initiate connection (Sender)
  async function connect() {
    console.log('[WEB_RTC] Initiating connect...')
    isSender = true
    dataChannel = pc.createDataChannel('fileTransfer', { ordered: true })
    dataChannel.binaryType = 'arraybuffer'
    dataChannel.bufferedAmountLowThreshold = 65536
    setupDataChannelHandlers(dataChannel)

    dataChannel.onopen = () => {
      console.log('[WEB_RTC] DataChannel onopen triggered (Sender)')
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    console.log('[WEB_RTC] Created offer and set local description')
    onOffer(pc.localDescription)
  }

  async function handleOffer(sdp) {
    console.log('[WEB_RTC] Handling offer...')
    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    await flushIceCandidates()
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    console.log('[WEB_RTC] Created answer and set local description')
    onAnswer(pc.localDescription)
  }

  async function handleAnswer(sdp) {
    console.log('[WEB_RTC] Handling answer...')
    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    await flushIceCandidates()
    console.log('[WEB_RTC] Set remote description from answer')
  }

  async function handleIceCandidate(candidate) {
    if (pc.remoteDescription && pc.remoteDescription.type) {
      console.log('[WEB_RTC] Adding remote ICE candidate directly:', candidate.candidate)
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    } else {
      console.log('[WEB_RTC] Queuing ICE candidate (remoteDescription not set):', candidate.candidate)
      iceCandidateQueue.push(candidate)
    }
  }

  async function flushIceCandidates() {
    console.log(`[WEB_RTC] Flushing ${iceCandidateQueue.length} queued ICE candidates...`)
    for (const candidate of iceCandidateQueue) {
      try {
        console.log('[WEB_RTC] Adding queued ICE candidate:', candidate.candidate)
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error('[WEB_RTC] Error adding queued ICE candidate', err)
        log.error('Error adding queued ICE candidate', err)
      }
    }
    iceCandidateQueue = []
  }

  async function sendFile(file) {
    console.log('[WEB_RTC] Starting sendFile for:', file.name)
    if (!dataChannel || dataChannel.readyState !== 'open') {
      console.error('[WEB_RTC] Data channel not open. readyState:', dataChannel?.readyState)
      throw new Error('Data channel not open')
    }

    console.log('[WEB_RTC] Sending FILE_META')
    dataChannel.send(JSON.stringify({
      type: 'FILE_META',
      meta: { name: file.name, size: file.size, type: file.type }
    }))

    // Give the receiver a moment to parse metadata and setup the buffer before blasting binary data
    await new Promise(r => setTimeout(r, 500))

    const reader = file.stream().getReader()
    let sentSize = 0
    let chunksSent = 0
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        const chunk = value.slice(i, i + CHUNK_SIZE)
        
        // Wait if buffer is full (Backpressure handling based on events with timeout fallback)
        if (dataChannel.bufferedAmount >= 65536) {
          dataChannel.bufferedAmountLowThreshold = 16384; // Trigger when it drops to 1 chunk size
          await new Promise((resolve, reject) => {
            let timeoutId;
            const handleLow = () => {
              cleanup()
              resolve()
            }
            const handleError = () => {
              cleanup()
              reject(new Error('DataChannel error during transfer'))
            }
            const handleClose = () => {
              cleanup()
              reject(new Error('DataChannel closed during transfer'))
            }
            
            const cleanup = () => {
              clearTimeout(timeoutId)
              dataChannel.removeEventListener('bufferedamountlow', handleLow)
              dataChannel.removeEventListener('error', handleError)
              dataChannel.removeEventListener('close', handleClose)
            }
            
            timeoutId = setTimeout(() => {
              console.warn('[WEB_RTC] bufferedamountlow timeout reached. Forcing resume.')
              cleanup()
              resolve()
            }, 5000) // 5 second fallback
            
            dataChannel.addEventListener('bufferedamountlow', handleLow)
            dataChannel.addEventListener('error', handleError)
            dataChannel.addEventListener('close', handleClose)
          })
        }
        
        // chunk is a Uint8Array. DataChannel natively supports ArrayBufferView.
        dataChannel.send(chunk)
        sentSize += chunk.byteLength
        chunksSent++
        
        if (chunksSent % 20 === 0) {
          console.log(`[WEB_RTC] Sent ${chunksSent} chunks. Progress: ${Math.round((sentSize / file.size) * 100)}%`)
        }
        onProgress?.(Math.round((sentSize / file.size) * 100))
      }
    }

    console.log('[WEB_RTC] Sending FILE_DONE')
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
