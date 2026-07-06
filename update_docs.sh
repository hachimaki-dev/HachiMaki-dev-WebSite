#!/bin/bash
FILES="AGENTS.md GEMINI.md CLAUDE.md .cursorrules .windsurfrules .clinerules"

for file in $FILES; do
  if [ -f "$file" ]; then
    # Add tables
    sed -i '/`friend_links`/a \- `peer_libraries` — P2P file sharing libraries\n- `peer_alerts` — P2P offline alerts\n- `p2p_signaling` — WebRTC P2P signaling' "$file"
    
    # Add folders
    sed -i '/src\/pages\/public\/Visitantes\//a src\/pages\/public\/Nexus\/   → NexusPage' "$file"
    sed -i '/src\/features\/friends\//a src\/features\/nexus\/        → useNexusLibrary, fileSystemDb, p2pDataChannel, nexusSignaling' "$file"
  fi
done
