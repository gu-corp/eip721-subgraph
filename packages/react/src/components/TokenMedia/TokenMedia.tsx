import {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { resolveTokenURI } from '@gu-corp/eip721-subgraph-client';
import { useEIP721Context } from '../../context';
import { useTokenMetadata } from '../../hooks/useTokenMetadata';

const DEFAULT_GATEWAY_TIMEOUT = 5000;

export type MediaType = 'auto' | 'image' | 'video';

/** Props for the TokenMedia component. */
export interface TokenMediaProps {
  /** A tokenURI to fetch metadata from. Extracts image/animation_url from metadata. */
  tokenURI?: string | null;
  /**
   * Media type to render.
   * - `'auto'` (default): renders `<video>` if `animation_url` exists in metadata, otherwise `<img>`
   * - `'image'`: always renders `<img>` using metadata `image` field
   * - `'video'`: always renders `<video>` using metadata `animation_url` field
   */
  mediaType?: MediaType;
  /** Fallback URL when all gateways fail or data is unavailable. */
  fallbackSrc?: string;
  /** Timeout in milliseconds per gateway attempt. Defaults to provider's timeout or 5000ms. */
  gatewayTimeout?: number;
  /** Content to show while loading token data or metadata. */
  loadingContent?: ReactNode;
  /** Content to show on fetch error. Can be a render function receiving the Error. */
  errorContent?: ReactNode | ((error: Error) => ReactNode);
  /** Callback when the media successfully loads. */
  onMediaLoad?: (event: SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => void;
  /** Callback when all gateways have been exhausted. */
  onAllGatewaysFailed?: () => void;
  /** Override IPFS gateways for this component (overrides provider config). */
  ipfsGateways?: string[];
  /** Override Arweave gateways for this component (overrides provider config). */
  arweaveGateways?: string[];

  // Common HTML attributes
  className?: string;
  style?: CSSProperties;
  alt?: string;
  width?: number | string;
  height?: number | string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';

  // Video-specific (only applied when rendering <video>)
  /** Auto-play video. Defaults to true. */
  autoPlay?: boolean;
  /** Loop video. Defaults to true. */
  loop?: boolean;
  /** Mute video. Defaults to true. */
  muted?: boolean;
  /** Show video controls. Defaults to false. */
  controls?: boolean;
  /** Plays inline on mobile. Defaults to true. */
  playsInline?: boolean;
}

// --- Internal hook for gateway fallback ---

function useResolvedSrc(options: {
  mediaURI: string | null | undefined;
  ipfsGateways?: string[];
  arweaveGateways?: string[];
  timeout: number;
  fallbackSrc?: string;
  onAllGatewaysFailed?: () => void;
}) {
  const {
    mediaURI,
    ipfsGateways,
    arweaveGateways,
    timeout,
    fallbackSrc,
    onAllGatewaysFailed,
  } = options;

  const [gatewayIndex, setGatewayIndex] = useState(0);
  const loadedRef = useRef(false);
  const exhaustedFiredRef = useRef(false);

  const resolvedUrls = useMemo(() => {
    if (!mediaURI) return [];
    try {
      return resolveTokenURI(mediaURI, { ipfsGateways, arweaveGateways });
    } catch {
      return [];
    }
  }, [mediaURI, ipfsGateways, arweaveGateways]);

  useEffect(() => {
    setGatewayIndex(0);
    loadedRef.current = false;
    exhaustedFiredRef.current = false;
  }, [mediaURI]);

  const exhausted = gatewayIndex >= resolvedUrls.length;

  const src = useMemo(() => {
    if (!mediaURI) return fallbackSrc;
    if (exhausted) return fallbackSrc;
    return resolvedUrls[gatewayIndex];
  }, [mediaURI, exhausted, resolvedUrls, gatewayIndex, fallbackSrc]);

  useEffect(() => {
    if (exhausted && resolvedUrls.length > 0 && !exhaustedFiredRef.current) {
      exhaustedFiredRef.current = true;
      onAllGatewaysFailed?.();
    }
  }, [exhausted, resolvedUrls.length, onAllGatewaysFailed]);

  const onError = useCallback(() => {
    if (!loadedRef.current) {
      setGatewayIndex((prev) => prev + 1);
    }
  }, []);

  const onLoad = useCallback(() => {
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!src || loadedRef.current || exhausted) return;

    const timer = setTimeout(() => {
      if (!loadedRef.current) {
        onError();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [src, timeout, onError, exhausted]);

  return { src, onError, onLoad };
}

// --- Resolve poster URL for video (from metadata image field) ---

function useResolvedPoster(
  imageURI: string | null | undefined,
  ipfsGateways?: string[],
  arweaveGateways?: string[],
): string | undefined {
  return useMemo(() => {
    if (!imageURI) return undefined;
    try {
      const urls = resolveTokenURI(imageURI, { ipfsGateways, arweaveGateways });
      return urls[0];
    } catch {
      return undefined;
    }
  }, [imageURI, ipfsGateways, arweaveGateways]);
}

// --- Component ---

/**
 * A React component that renders NFT media (image or video) from a tokenURI,
 * with IPFS/Arweave gateway fallback.
 *
 * Fetches metadata from the tokenURI, then resolves the `image` or `animation_url`
 * through configured gateways. In `auto` mode (default), renders `<video>` if
 * `animation_url` exists in metadata, otherwise renders `<img>`.
 *
 * @example
 * ```tsx
 * // Auto-detect: video if animation_url exists, image otherwise
 * <TokenMedia tokenURI={token.tokenURI} fallbackSrc="/placeholder.png" />
 *
 * // Force image mode
 * <TokenMedia tokenURI={token.tokenURI} mediaType="image" />
 * ```
 */
export const TokenMedia = forwardRef<HTMLImageElement | HTMLVideoElement, TokenMediaProps>(
  function TokenMedia(props, ref) {
    const {
      tokenURI,
      mediaType = 'auto',
      fallbackSrc,
      gatewayTimeout,
      loadingContent,
      errorContent,
      onMediaLoad,
      onAllGatewaysFailed,
      ipfsGateways: propIpfsGateways,
      arweaveGateways: propArweaveGateways,
      // Common HTML attributes
      className,
      style,
      alt,
      width,
      height,
      crossOrigin,
      // Video-specific
      autoPlay = true,
      loop = true,
      muted = true,
      controls = false,
      playsInline = true,
    } = props;

    const { metadataOptions } = useEIP721Context();

    const ipfsGateways = propIpfsGateways ?? metadataOptions.ipfsGateways;
    const arweaveGateways = propArweaveGateways ?? metadataOptions.arweaveGateways;
    const timeout = gatewayTimeout ?? metadataOptions.timeout ?? DEFAULT_GATEWAY_TIMEOUT;

    // Step 1: Fetch metadata from tokenURI
    const metadataResult = useTokenMetadata(tokenURI);

    // Step 2: Determine if we render video or image
    const renderVideo = useMemo(() => {
      if (mediaType === 'image') return false;
      if (mediaType === 'video') return true;
      // auto: use video if animation_url exists
      return !!metadataResult.data?.animation_url;
    }, [mediaType, metadataResult.data?.animation_url]);

    // Step 3: Determine the media URI to resolve
    const mediaURI = useMemo(() => {
      if (renderVideo) return metadataResult.data?.animation_url as string ?? null;
      return metadataResult.data?.image ?? null;
    }, [renderVideo, metadataResult.data?.animation_url, metadataResult.data?.image]);

    // Step 4: Resolve poster for video (from metadata image)
    const posterSrc = useResolvedPoster(
      renderVideo ? metadataResult.data?.image ?? null : null,
      ipfsGateways,
      arweaveGateways,
    );

    // Step 5: Gateway fallback
    const {
      src: resolvedSrc,
      onError: handleGatewayError,
      onLoad: handleGatewayLoad,
    } = useResolvedSrc({
      mediaURI,
      ipfsGateways,
      arweaveGateways,
      timeout,
      fallbackSrc,
      onAllGatewaysFailed,
    });

    // Loading / error state
    const { loading: isLoading, error: fetchError } = metadataResult;

    if (isLoading && loadingContent) {
      return <>{loadingContent}</>;
    }

    if (fetchError && errorContent) {
      return <>{typeof errorContent === 'function' ? errorContent(fetchError) : errorContent}</>;
    }

    if (!resolvedSrc) {
      return null;
    }

    const commonProps = { className, style, width, height, crossOrigin };

    if (renderVideo) {
      return (
        <video
          ref={ref as React.Ref<HTMLVideoElement>}
          src={resolvedSrc}
          poster={posterSrc}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          playsInline={playsInline}
          aria-label={alt}
          onError={handleGatewayError}
          onLoadedData={(e) => {
            handleGatewayLoad();
            onMediaLoad?.(e);
          }}
          {...commonProps}
        />
      );
    }

    return (
      <img
        ref={ref as React.Ref<HTMLImageElement>}
        src={resolvedSrc}
        alt={alt}
        onError={handleGatewayError}
        onLoad={(e) => {
          handleGatewayLoad();
          onMediaLoad?.(e);
        }}
        {...commonProps}
      />
    );
  },
);
