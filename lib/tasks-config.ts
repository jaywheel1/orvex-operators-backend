// Console Operators Task Configuration
// Based on the 8-week testnet campaign plan

export type TaskCategory = 'social' | 'trading' | 'liquidity' | 'advanced' | 'consistency';
export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'unlimited';
export type TaskStatus = 'active' | 'locked' | 'coming_soon';

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  cp_reward: number;
  cap: number; // Max times this can be completed (0 = unlimited)
  frequency: TaskFrequency;
  status: TaskStatus;
  verification_type: 'auto' | 'manual' | 'screenshot' | 'link' | 'onchain';
  total_possible_cp: number;
}

export interface CategoryDefinition {
  id: TaskCategory;
  name: string;
  description: string;
  max_cp: number;
  status: TaskStatus;
  icon: string; // SVG path or icon name
}

// Category Definitions
export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'social',
    name: 'Social Operations',
    description: 'X/Twitter engagement and content creation',
    max_cp: 2400,
    status: 'active',
    icon: 'social',
  },
  {
    id: 'trading',
    name: 'Trading Operations',
    description: 'Swaps, trading volume, and market activity',
    max_cp: 12000,
    status: 'coming_soon',
    icon: 'trading',
  },
  {
    id: 'liquidity',
    name: 'Liquidity Operations',
    description: 'LP positions, pool management, and liquidity provision',
    max_cp: 25000,
    status: 'coming_soon',
    icon: 'liquidity',
  },
  {
    id: 'advanced',
    name: 'Advanced Operations',
    description: 'Governance, feedback, and community engagement',
    max_cp: 18500,
    status: 'active', // Partially active
    icon: 'advanced',
  },
  {
    id: 'consistency',
    name: 'Consistency Bonus',
    description: 'Weekly streaks and participation rewards',
    max_cp: 16000,
    status: 'coming_soon',
    icon: 'consistency',
  },
];

// Task Definitions - Social Operations
export const SOCIAL_TASKS: TaskDefinition[] = [
  {
    id: 'follow-orvex',
    name: 'Follow Orvex on X',
    description: 'Follow @OrvexFi on X/Twitter',
    category: 'social',
    cp_reward: 100,
    cap: 1,
    frequency: 'once',
    status: 'active',
    verification_type: 'screenshot',
    total_possible_cp: 100,
  },
  {
    id: 'follow-status',
    name: 'Follow Status Network on X',
    description: 'Follow @StatusNetwork on X/Twitter',
    category: 'social',
    cp_reward: 100,
    cap: 1,
    frequency: 'once',
    status: 'active',
    verification_type: 'screenshot',
    total_possible_cp: 100,
  },
  {
    id: 'join-community',
    name: 'Join Orvex Community',
    description: 'Join the Orvex community on X',
    category: 'social',
    cp_reward: 300,
    cap: 1,
    frequency: 'once',
    status: 'active',
    verification_type: 'screenshot',
    total_possible_cp: 300,
  },
  {
    id: 'retweet',
    name: 'Retweet Announcement',
    description: 'Retweet an official Orvex announcement',
    category: 'social',
    cp_reward: 50,
    cap: 8,
    frequency: 'unlimited',
    status: 'active',
    verification_type: 'link',
    total_possible_cp: 400,
  },
  {
    id: 'quote-tweet',
    name: 'Quote Tweet with Thoughts',
    description: 'Quote tweet an Orvex post with your thoughts',
    category: 'social',
    cp_reward: 100,
    cap: 5,
    frequency: 'weekly',
    status: 'active',
    verification_type: 'link',
    total_possible_cp: 500,
  },
  {
    id: 'create-content',
    name: 'Create Orvex Content',
    description: 'Create original content about Orvex (threads, videos, articles)',
    category: 'social',
    cp_reward: 500,
    cap: 4,
    frequency: 'weekly',
    status: 'active',
    verification_type: 'manual',
    total_possible_cp: 2000,
  },
  {
    id: 'refer-friend',
    name: 'Refer a Friend',
    description: 'Invite a friend who completes registration',
    category: 'social',
    cp_reward: 200,
    cap: 5,
    frequency: 'unlimited',
    status: 'active',
    verification_type: 'auto',
    total_possible_cp: 1000,
  },
];

// Task Definitions - Trading Operations (LOCKED)
export const TRADING_TASKS: TaskDefinition[] = [
  {
    id: 'first-swap',
    name: 'Complete First Swap',
    description: 'Execute your first swap on the testnet',
    category: 'trading',
    cp_reward: 200,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 200,
  },
  {
    id: 'swap-testnet',
    name: 'Swap on Testnet',
    description: 'Complete a swap transaction',
    category: 'trading',
    cp_reward: 25,
    cap: 80,
    frequency: 'daily',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 2000,
  },
  {
    id: 'swap-pairs',
    name: 'Swap 5+ Different Pairs',
    description: 'Trade across 5 or more unique token pairs',
    category: 'trading',
    cp_reward: 100,
    cap: 10,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1000,
  },
  {
    id: 'volume-1k',
    name: 'Trade Volume $1K',
    description: 'Reach $1,000 in total trading volume',
    category: 'trading',
    cp_reward: 200,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 200,
  },
  {
    id: 'volume-5k',
    name: 'Trade Volume $5K',
    description: 'Reach $5,000 in total trading volume',
    category: 'trading',
    cp_reward: 300,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 300,
  },
  {
    id: 'volume-10k',
    name: 'Trade Volume $10K',
    description: 'Reach $10,000 in total trading volume',
    category: 'trading',
    cp_reward: 500,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 500,
  },
  {
    id: 'daily-trader',
    name: 'Daily Active Trader',
    description: 'Make at least one trade per day',
    category: 'trading',
    cp_reward: 100,
    cap: 40,
    frequency: 'daily',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 4000,
  },
  {
    id: 'limit-order',
    name: 'Execute Limit Order',
    description: 'Place and execute a limit order',
    category: 'trading',
    cp_reward: 50,
    cap: 20,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1000,
  },
  {
    id: 'multi-hop',
    name: 'Multi-hop Swap',
    description: 'Execute a swap through 3+ pools',
    category: 'trading',
    cp_reward: 75,
    cap: 30,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 2250,
  },
  {
    id: 'bridge-assets',
    name: 'Bridge Assets',
    description: 'Bridge assets to Status testnet',
    category: 'trading',
    cp_reward: 150,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 150,
  },
  {
    id: 'test-slippage',
    name: 'Test Slippage Settings',
    description: 'Adjust and test slippage tolerance',
    category: 'trading',
    cp_reward: 50,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 50,
  },
];

// Task Definitions - Liquidity Operations (LOCKED)
export const LIQUIDITY_TASKS: TaskDefinition[] = [
  {
    id: 'first-lp',
    name: 'Add First Liquidity',
    description: 'Create your first liquidity position',
    category: 'liquidity',
    cp_reward: 300,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 300,
  },
  {
    id: 'provide-lp',
    name: 'Provide Liquidity',
    description: 'Add liquidity to any pool',
    category: 'liquidity',
    cp_reward: 100,
    cap: 50,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 5000,
  },
  {
    id: 'lp-3-pools',
    name: 'LP in 3+ Pools',
    description: 'Have active positions in 3+ different pools',
    category: 'liquidity',
    cp_reward: 200,
    cap: 8,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1600,
  },
  {
    id: 'maintain-lp-7d',
    name: 'Maintain LP 7 Days',
    description: 'Keep liquidity position for 7 consecutive days',
    category: 'liquidity',
    cp_reward: 500,
    cap: 4,
    frequency: 'weekly',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 2000,
  },
  {
    id: 'maintain-lp-14d',
    name: 'Maintain LP 14 Days',
    description: 'Keep liquidity position for 14 consecutive days',
    category: 'liquidity',
    cp_reward: 1000,
    cap: 2,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 2000,
  },
  {
    id: 'lp-volume-500',
    name: 'LP Volume $500',
    description: 'Reach $500 in total LP value',
    category: 'liquidity',
    cp_reward: 200,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 200,
  },
  {
    id: 'lp-volume-2k',
    name: 'LP Volume $2K',
    description: 'Reach $2,000 in total LP value',
    category: 'liquidity',
    cp_reward: 400,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 400,
  },
  {
    id: 'lp-volume-5k',
    name: 'LP Volume $5K',
    description: 'Reach $5,000 in total LP value',
    category: 'liquidity',
    cp_reward: 800,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 800,
  },
  {
    id: 'concentrated-lp',
    name: 'Concentrated LP Position',
    description: 'Create a concentrated liquidity position',
    category: 'liquidity',
    cp_reward: 150,
    cap: 20,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 3000,
  },
  {
    id: 'rebalance-lp',
    name: 'Rebalance LP Position',
    description: 'Adjust your LP position range',
    category: 'liquidity',
    cp_reward: 75,
    cap: 40,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 3000,
  },
  {
    id: 'multi-pool-lp',
    name: 'Multi-pool LP',
    description: 'Maintain positions in 3+ pools simultaneously',
    category: 'liquidity',
    cp_reward: 300,
    cap: 10,
    frequency: 'weekly',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 3000,
  },
  {
    id: 'weekly-lp',
    name: 'Weekly LP Provider',
    description: 'Provide liquidity each week',
    category: 'liquidity',
    cp_reward: 200,
    cap: 8,
    frequency: 'weekly',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1600,
  },
  {
    id: 'remove-readd-lp',
    name: 'Remove & Re-add LP',
    description: 'Cycle liquidity to test the process',
    category: 'liquidity',
    cp_reward: 50,
    cap: 30,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1500,
  },
];

// Task Definitions - Advanced Operations (PARTIAL)
export const ADVANCED_TASKS: TaskDefinition[] = [
  {
    id: 'vote-gauge',
    name: 'Vote on Gauge Weights',
    description: 'Participate in gauge weight voting',
    category: 'advanced',
    cp_reward: 100,
    cap: 20,
    frequency: 'weekly',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 2000,
  },
  {
    id: 'lock-tokens',
    name: 'Lock Tokens',
    description: 'Lock tokens for voting power',
    category: 'advanced',
    cp_reward: 300,
    cap: 5,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1500,
  },
  {
    id: 'create-pool',
    name: 'Create Liquidity Pool',
    description: 'Create a new liquidity pool',
    category: 'advanced',
    cp_reward: 500,
    cap: 3,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1500,
  },
  {
    id: 'governance-vote',
    name: 'Governance Vote',
    description: 'Vote on a governance proposal',
    category: 'advanced',
    cp_reward: 200,
    cap: 8,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1600,
  },
  {
    id: 'provide-feedback',
    name: 'Provide Detailed Feedback',
    description: 'Submit detailed product feedback',
    category: 'advanced',
    cp_reward: 150,
    cap: 12,
    frequency: 'weekly',
    status: 'active',
    verification_type: 'manual',
    total_possible_cp: 1800,
  },
  {
    id: 'report-bug',
    name: 'Report Bug',
    description: 'Report a verified bug with reproduction steps',
    category: 'advanced',
    cp_reward: 500,
    cap: 6,
    frequency: 'unlimited',
    status: 'active',
    verification_type: 'manual',
    total_possible_cp: 3000,
  },
  {
    id: 'test-feature',
    name: 'Test New Feature',
    description: 'Participate in early access feature testing',
    category: 'advanced',
    cp_reward: 300,
    cap: 8,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'manual',
    total_possible_cp: 2400,
  },
  {
    id: 'x-space',
    name: 'Participate in X Space/AMA',
    description: 'Join and engage in an official X Space',
    category: 'advanced',
    cp_reward: 300,
    cap: 8,
    frequency: 'weekly',
    status: 'active',
    verification_type: 'manual',
    total_possible_cp: 2400,
  },
  {
    id: 'complete-tutorial',
    name: 'Complete Tutorial',
    description: 'Finish an education module or tutorial',
    category: 'advanced',
    cp_reward: 100,
    cap: 15,
    frequency: 'unlimited',
    status: 'active',
    verification_type: 'auto',
    total_possible_cp: 1500,
  },
  {
    id: 'stress-test',
    name: 'Stress Test Participation',
    description: 'Participate in coordinated stress testing',
    category: 'advanced',
    cp_reward: 500,
    cap: 2,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'manual',
    total_possible_cp: 1000,
  },
  {
    id: 'community-engage',
    name: 'Community Engagement',
    description: 'Meaningful engagement in X Community',
    category: 'advanced',
    cp_reward: 50,
    cap: 16,
    frequency: 'weekly',
    status: 'active',
    verification_type: 'manual',
    total_possible_cp: 800,
  },
];

// Task Definitions - Consistency Bonus (LOCKED)
export const CONSISTENCY_TASKS: TaskDefinition[] = [
  {
    id: 'weekly-active',
    name: 'Weekly Active',
    description: 'Complete at least one transaction per week',
    category: 'consistency',
    cp_reward: 200,
    cap: 8,
    frequency: 'weekly',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1600,
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Trade + LP + Vote in the same week',
    category: 'consistency',
    cp_reward: 500,
    cap: 8,
    frequency: 'weekly',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 4000,
  },
  {
    id: 'streak-3w',
    name: '3-Week Streak',
    description: 'Maintain activity for 3 consecutive weeks',
    category: 'consistency',
    cp_reward: 400,
    cap: 2,
    frequency: 'unlimited',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 800,
  },
  {
    id: 'streak-5w',
    name: '5-Week Streak',
    description: 'Maintain activity for 5 consecutive weeks',
    category: 'consistency',
    cp_reward: 1000,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 1000,
  },
  {
    id: 'full-8w',
    name: 'Full 8-Week Participation',
    description: 'Active participation throughout the entire campaign',
    category: 'consistency',
    cp_reward: 3000,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'onchain',
    total_possible_cp: 3000,
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter (Week 1)',
    description: 'Register and participate in Week 1',
    category: 'consistency',
    cp_reward: 500,
    cap: 1,
    frequency: 'once',
    status: 'active',
    verification_type: 'auto',
    total_possible_cp: 500,
  },
  {
    id: 'testnet-og',
    name: 'Testnet OG',
    description: 'Among the first 100 users to register',
    category: 'consistency',
    cp_reward: 1000,
    cap: 1,
    frequency: 'once',
    status: 'active',
    verification_type: 'auto',
    total_possible_cp: 1000,
  },
  {
    id: 'grand-marshal',
    name: 'Grand Marshal',
    description: 'Finish in top 50 on the leaderboard',
    category: 'consistency',
    cp_reward: 2000,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'auto',
    total_possible_cp: 2000,
  },
  {
    id: 'first-architect',
    name: 'First to Architect',
    description: 'First user to reach Architect rank',
    category: 'consistency',
    cp_reward: 2000,
    cap: 1,
    frequency: 'once',
    status: 'coming_soon',
    verification_type: 'auto',
    total_possible_cp: 2000,
  },
];

// All tasks combined
export const ALL_TASKS: TaskDefinition[] = [
  ...SOCIAL_TASKS,
  ...TRADING_TASKS,
  ...LIQUIDITY_TASKS,
  ...ADVANCED_TASKS,
  ...CONSISTENCY_TASKS,
];

// Get tasks by category
export function getTasksByCategory(category: TaskCategory): TaskDefinition[] {
  return ALL_TASKS.filter(task => task.category === category);
}

// Get active tasks only
export function getActiveTasks(): TaskDefinition[] {
  return ALL_TASKS.filter(task => task.status === 'active');
}

// Get category by id
export function getCategoryById(id: TaskCategory): CategoryDefinition | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

// Operator Rank Structure
export interface RankDefinition {
  name: string;
  multiplier: number;
  cp_required: number;
  percent_users: string;
}

export const RANKS: RankDefinition[] = [
  { name: 'Operator', multiplier: 1.5, cp_required: 1000, percent_users: '~80%' },
  { name: 'Controller', multiplier: 3, cp_required: 5000, percent_users: '~50%' },
  { name: 'Commander', multiplier: 5, cp_required: 15000, percent_users: '~20%' },
  { name: 'Marshal', multiplier: 7, cp_required: 35000, percent_users: '~5%' },
  { name: 'Architect', multiplier: 10, cp_required: 75000, percent_users: '~1%' },
];

// Get user's current rank based on CP
export function getUserRank(cp: number): RankDefinition | null {
  // Find the highest rank the user qualifies for
  const qualifiedRanks = RANKS.filter(rank => cp >= rank.cp_required);
  return qualifiedRanks.length > 0 ? qualifiedRanks[qualifiedRanks.length - 1] : null;
}

// Get next rank for user
export function getNextRank(cp: number): RankDefinition | null {
  const nextRank = RANKS.find(rank => cp < rank.cp_required);
  return nextRank || null;
}

// Calculate progress to next rank (0-100)
export function getRankProgress(cp: number): number {
  const currentRank = getUserRank(cp);
  const nextRank = getNextRank(cp);

  if (!nextRank) return 100; // Already at max rank

  const startCP = currentRank?.cp_required || 0;
  const endCP = nextRank.cp_required;
  const progress = ((cp - startCP) / (endCP - startCP)) * 100;

  return Math.min(100, Math.max(0, progress));
}
