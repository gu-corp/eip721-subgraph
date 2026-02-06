---
"@gu-corp/eip721-subgraph-react": minor
---

Add TokenMedia component for rendering NFT media with gateway fallback

- Add `TokenMedia` component that renders `<img>` or `<video>` from a tokenURI
- Auto-detects video vs image based on metadata `animation_url` field
- Supports `mediaType` prop to force image or video rendering
- IPFS/Arweave gateway fallback with configurable timeout
- Supports `fallbackSrc`, `loadingContent`, `errorContent` for loading/error states
- Respects provider-level gateway configuration with per-component overrides
