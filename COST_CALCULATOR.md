# Cost Calculator for Movie2Book

## OpenAI GPT-5 Nano Pricing (2025)
- **Input:** $0.050 per 1M tokens
- **Output:** $0.400 per 1M tokens

## Frame Extraction: 3 frames per 10 seconds

### Cost Breakdown Per Video:

#### 1. Frame Descriptions
- **Frames per video:**
  - 10 minutes: 180 frames (60 intervals × 3)
  - 1 hour: 1,080 frames (360 intervals × 3)
  - 2 hours: 2,160 frames (720 intervals × 3)

- **Per frame API call:**
  - Image input: ~85 tokens (vision model)
  - Text prompt: ~100 tokens
  - Response: ~300 tokens average
  - **Total per frame:** ~485 tokens (85 input + 400 total)

- **Cost per frame:**
  - Input: 185 tokens × $0.050/1M = $0.00000925
  - Output: 300 tokens × $0.400/1M = $0.00012
  - **Total per frame:** ~$0.00013

#### 2. Narrative Generation
- **Input tokens:** ~500-2,000 (all frame descriptions + dialogue)
- **Output tokens:** ~2,000-8,000 (narrative text)
- **Cost:** ~$0.0001 - $0.0035 per narrative

### Total Cost Examples:

**10-minute video:**
- 180 frames × $0.00013 = **$0.0234** (frame descriptions)
- Narrative: ~$0.001
- **Total: ~$0.025** (2.5 cents)

**1-hour video:**
- 1,080 frames × $0.00013 = **$0.1404** (frame descriptions)
- Narrative: ~$0.002
- **Total: ~$0.14** (14 cents)

**2-hour video:**
- 2,160 frames × $0.00013 = **$0.2808** (frame descriptions)
- Narrative: ~$0.0035
- **Total: ~$0.28** (28 cents)

## Comparison: 2 vs 3 frames per 10 seconds

**2 frames per 10 seconds:**
- 10 min: $0.017
- 1 hour: $0.10
- 2 hours: $0.20

**3 frames per 10 seconds (current):**
- 10 min: $0.025
- 1 hour: $0.14
- 2 hours: $0.28

**Difference:** ~50% more frames = ~50% more cost

## Notes:
- Costs are estimates based on average token usage
- Actual costs may vary based on video content complexity
- Audio transcription (Whisper) is free (local processing)
- Chunked videos may have slightly higher costs due to multiple narrative generations
