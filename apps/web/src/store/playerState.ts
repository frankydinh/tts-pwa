/**
 * Player state management.
 * Implementation will be added in Phase 4.
 */
export interface PlayerState {
  isPlaying: boolean;
  currentChunkIndex: number;
  playbackRate: number;
}

export const initialPlayerState: PlayerState = {
  isPlaying: false,
  currentChunkIndex: 0,
  playbackRate: 1,
};
