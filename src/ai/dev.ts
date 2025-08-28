import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-blood-report.ts';
import '@/ai/flows/analyze-skin-condition.ts';
import '@/ai/flows/find-hospitals.ts';
import '@/ai/flows/chat.ts';
