# Speed Optimizations Applied

## Changes Made:

1. **Reduced API delay**: `REQUEST_DELAY` from 1 second → 0.2 seconds
   - Saves ~0.8 seconds per frame
   - For 36 frames: saves ~29 seconds

2. **Faster Whisper model**: Changed from "base" → "tiny"
   - Much faster transcription (3-5x faster)
   - Slightly less accurate but still good for dialogue

3. **Shorter prompts**: Reduced frame description prompt length
   - Faster API responses
   - Reduced token usage

4. **Reduced token limits**: `max_completion_tokens` from 1000 → 500 for frame descriptions
   - Faster API responses
   - Still enough for good descriptions

5. **Removed unnecessary delays**: Removed `time.sleep(REQUEST_DELAY)` before narrative generation
   - Saves 1-2 seconds per chunk

6. **Reduced console output**: Only prints every 5th frame progress
   - Less I/O overhead

## Expected Speed Improvements:

**Before:**
- 2-minute video: ~3-4 minutes
- 10-minute video: ~15-20 minutes

**After:**
- 2-minute video: ~1.5-2 minutes (50% faster)
- 10-minute video: ~8-12 minutes (40% faster)

## Further Optimization Options:

If still too slow, you can:
1. Reduce frames: Change to 2 frames per 10 seconds (saves ~33% time)
2. Increase frame interval: Change to 15 seconds (saves ~33% time)
3. Skip audio transcription: Remove Whisper step (saves 30-60 seconds)
4. Process frames in parallel: Batch API calls (risks rate limits)
