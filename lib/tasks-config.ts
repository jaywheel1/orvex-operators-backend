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
    description: 'Signal the Vortex. Amplify Orvex across X.',
    max_cp: 4400,
    status: 'active',
    icon: 'social',
  },
  {
    id: 'trading',
    name: 'Trading Operations',
    description: 'Execute swaps. Build volume. Test execution.',
    max_cp: 11650,
    status: 'coming_soon',
    icon: 'trading',
  },
  {
    id: 'liquidity',
    name: 'Liquidity Operations',
    description: 'Deploy capital. Manage positions. Provide depth.',
    max_cp: 24400,
    status: 'coming_soon',
    icon: 'liquidity',
  },
  {
    id: 'advanced',
    name: 'Advanced Operations',
    description: 'Governance, protocol feedback, and stress testing.',
    max_cp: 19500,
    status: 'active', // Partially active
    icon: 'advanced',
  },
  {
    id: 'consistency',
    name: 'Consistency Bonus',
    description: 'Show up. Stay active. Compound your rank.',
    max_cp: 15900,
    status: 'coming_soon',
    icon: 'consistency',
  },
];

// Task Definitions - Social Operations
export const SOCIAL_TASKS: TaskDefinition[] = [
  {
    id: 'follow-orvex',
    name: 'Follow Orvex on X',
    description: 'Follow @OrvexFi. First signal received.',
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
    description: 'Follow @StatusNetwork. Monitor the network.',
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
    description: 'Enter the Orvex X Community. Join the operator channel.',
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
    name: 'Retweet Campaign Signal',
    description: 'Amplify an official Orvex signal. Retweet a campaign post.',
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
    name: 'Quote Tweet with Commentary',
    description: 'Quote an Orvex post. Add your take. Minimum 20 words of original commentary.',
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
    name: 'Create Original Content',
    description: 'Publish original Orvex content — thread, article, or video. Reviewed for quality.',
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
    name: 'Recruit an Operator',
    description: 'Share your recruitment link. Earn CP when new operators complete registration.',
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
    name: 'Execute First Swap',
    description: 'Execute your first swap on the Orvex testnet.',
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
    name: 'Execute Swap',
    description: 'Execute a swap on any Orvex pool.',
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
    name: 'Route Across 5+ Pairs',
    description: 'Execute swaps across 5+ unique token pairs.',
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
    name: 'Volume Milestone: $1K',
    description: 'Cumulative swap volume reaches $1,000.',
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
    name: 'Volume Milestone: $5K',
    description: 'Cumulative swap volume reaches $5,000.',
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
    name: 'Volume Milestone: $10K',
    description: 'Cumulative swap volume reaches $10,000.',
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
    name: 'Daily Active Operator',
    description: 'Execute at least one swap per calendar day (UTC).',
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
    description: 'Place and execute a limit order on testnet.',
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
    name: 'Multi-Hop Route',
    description: 'Execute a swap routed through 3+ liquidity pools.',
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
    name: 'Bridge to Status Testnet',
    description: 'Bridge assets to Status Network testnet.',
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
    name: 'Test Slippage Controls',
    description: 'Adjust slippage tolerance settings and execute a swap.',
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
    name: 'Deploy First Position',
    description: 'Deploy your first liquidity position on Orvex.',
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
    name: 'Deploy Liquidity',
    description: 'Deploy liquidity to any Orvex pool.',
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
    name: 'Deploy Across 3+ Pools',
    description: 'Maintain active positions across 3+ pools.',
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
    name: 'Hold Position 7 Days',
    description: 'Maintain a deployed position for 7 consecutive days.',
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
    name: 'Hold Position 14 Days',
    description: 'Maintain a deployed position for 14 consecutive days.',
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
    name: 'Deployment Milestone: $500',
    description: 'Cumulative deployed liquidity reaches $500.',
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
    name: 'Deployment Milestone: $2K',
    description: 'Cumulative deployed liquidity reaches $2,000.',
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
    name: 'Deployment Milestone: $5K',
    description: 'Cumulative deployed liquidity reaches $5,000.',
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
    name: 'Concentrated Position',
    description: 'Deploy a concentrated liquidity position with a defined range.',
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
    name: 'Rebalance Position',
    description: 'Adjust your position range. Rebalance to optimise depth.',
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
    name: 'Multi-Pool Deployment',
    description: 'Hold active positions across 3+ pools at the same time.',
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
    name: 'Weekly Deployment',
    description: 'Deploy liquidity during each campaign week.',
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
    name: 'Cycle Liquidity',
    description: 'Remove and re-deploy liquidity. Test the full cycle.',
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
    name: 'Vote on Gauge Allocation',
    description: 'Allocate your vote to a gauge. Direct incentives.',
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
    name: 'Lock Tokens (veNFT)',
    description: 'Lock tokens to create a veNFT. Unlock governance power.',
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
    name: 'Create New Pool',
    description: 'Deploy a new liquidity pool on Orvex testnet.',
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
    description: 'Vote on an active governance proposal.',
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
    name: 'Submit Protocol Feedback',
    description: 'Submit detailed feedback on Orvex — UI, execution, docs, or strategy. Min 100 words.',
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
    name: 'Report Verified Bug',
    description: 'Report a bug with clear reproduction steps. Verified by the dev team.',
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
    name: 'Early Access Testing',
    description: 'Test a newly released feature. Submit findings.',
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
    name: 'Attend X Space / AMA',
    description: 'Join an official Orvex X Space or AMA. Engage in the discussion.',
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
    name: 'Complete Training Module',
    description: 'Complete an Orvex or Status Network training module.',
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
    name: 'Stress Test Deployment',
    description: 'Participate in a coordinated testnet stress test event.',
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
    name: 'Community Signal',
    description: 'Post meaningfully in the Orvex X Community. Quality over quantity.',
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
    name: 'Weekly Active Operator',
    description: 'Execute at least one operation per campaign week.',
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
    name: 'Perfect Execution Week',
    description: 'Execute a swap + deploy liquidity + vote in the same week.',
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
    name: '3-Week Operations Streak',
    description: 'Maintain active operations for 3 consecutive weeks.',
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
    name: '5-Week Operations Streak',
    description: 'Maintain active operations for 5 consecutive weeks.',
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
    name: 'Full Campaign Deployment',
    description: 'Active in all 8 campaign weeks. The ultimate consistency signal.',
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
    name: 'Early Deployer (Week 1)',
    description: 'Register and execute an operation in Week 1.',
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
    name: 'First 100 Operators',
    description: 'Among the first 100 operators to enter the Vortex.',
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
    name: 'Top 50 Finish',
    description: 'Finish in the top 50 on the operator leaderboard.',
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
    description: 'First operator to reach Architect rank. 10x confirmed.',
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
