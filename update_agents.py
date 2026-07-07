import os
import glob

files = ["AGENTS.md", "CLAUDE.md", ".clinerules", ".cursorrules", "GEMINI.md", ".github/copilot-instructions.md", ".windsurfrules"]

for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r') as file:
        content = file.read()
    
    # Update peer_libraries
    content = content.replace(
        "`peer_libraries` — P2P file sharing libraries", 
        "`peer_libraries` — P2P file sharing libraries (with downloads_count, shares_count)"
    )
    content = content.replace(
        "`peer_libraries` | `visitor_id`, `alias`, `files`, `is_online` |",
        "`peer_libraries` | `visitor_id`, `alias`, `files`, `is_online`, `downloads_count`, `shares_count` |"
    )
    
    # Add nexus_activity
    if "`nexus_activity`" not in content:
        content = content.replace(
            "`p2p_signaling` — WebRTC P2P signaling",
            "`p2p_signaling` — WebRTC P2P signaling\n- `nexus_activity` — P2P activity log"
        )
        content = content.replace(
            "`p2p_signaling` | `id`, `sender_id`, `target_id`, `type`, `payload` | Public read/insert/delete |",
            "`p2p_signaling` | `id`, `sender_id`, `target_id`, `type`, `payload` | Public read/insert/delete |\n| `nexus_activity` | `id`, `visitor_id`, `action_type`, `details` | Public read/insert/delete |"
        )
        
    # Update components
    content = content.replace(
        "src/components/nexus/          → NexusLocalVault, NexusTerminalCard",
        "src/components/nexus/          → NexusPeerLibraryModal, NexusTerminalCard"
    )
    
    with open(f, 'w') as file:
        file.write(content)
    print(f"Updated {f}")
