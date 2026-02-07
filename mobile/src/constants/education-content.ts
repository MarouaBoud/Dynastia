/**
 * Investment Education Content
 *
 * 8 education modules covering ETF-first investing philosophy.
 * Content builds confidence without promoting trading behavior (WEALTH-04).
 * Each module has a key takeaway for retention.
 */

export interface EducationModule {
  id: string;
  title: string;
  duration: string;      // "3 min read"
  content: string;       // Main educational content
  keyTakeaway: string;   // Single memorable insight
  hasInteractive?: boolean; // If module has calculator/chart
}

export const EDUCATION_MODULES: EducationModule[] = [
  {
    id: 'what_are_etfs',
    title: 'What are ETFs?',
    duration: '3 min read',
    content: `Exchange-traded funds (ETFs) are like baskets containing many investments—hundreds or thousands of stocks bundled together.

When you buy one share of an ETF, you instantly own a tiny piece of every company in that basket. A total stock market ETF might hold Apple, Microsoft, small local businesses, and everything in between.

This is the opposite of stock picking. Instead of trying to find the next big winner (which even professionals fail at consistently), you own a piece of the entire market.

Why does this matter? Diversification. If one company fails, your whole investment doesn't go down with it. You're betting on the economy as a whole, not individual companies.`,
    keyTakeaway: 'ETFs provide instant diversification at low cost—you own the whole market, not individual bets.'
  },
  {
    id: 'compound_growth',
    title: 'The Power of Compounding',
    duration: '4 min read',
    content: `Compounding is when your money makes money, and then that money makes more money. It's the most powerful force in building wealth.

Here's the magic: If you invest $500/month starting at 25, by 65 you could have over $1.2 million (at 7% average return). But if you wait until 35, you'd have only about $550,000—less than half.

That 10-year head start is worth $650,000. Not because you invested more money, but because your early money had more time to compound.

The formula is simple: Time + Consistency = Wealth. You don't need to be rich to become wealthy. You need to start early and stay the course.`,
    keyTakeaway: 'Time in the market beats timing the market. Start now, stay consistent.',
    hasInteractive: true
  },
  {
    id: 'fees_matter',
    title: 'Why Fees Destroy Wealth',
    duration: '3 min read',
    content: `A 1% fee sounds tiny, but over 30 years it can cost you hundreds of thousands of dollars.

Imagine two identical investments: one charges 0.03% (like a Vanguard index fund), another charges 1% (like many actively managed funds). Over 30 years with $500/month invested:
• 0.03% fee: $612,000
• 1% fee: $498,000

That "small" fee difference cost you $114,000—nearly 20% of your wealth.

This is why we recommend low-cost index funds and ETFs. You're not paying for a manager to pick stocks (who statistically underperform the market anyway).`,
    keyTakeaway: 'A 1% fee can cost you 20% of your wealth over 30 years. Choose low-cost index funds.'
  },
  {
    id: 'diversification',
    title: 'Diversification: Your Safety Net',
    duration: '3 min read',
    content: `Diversification means not putting all your eggs in one basket. It's your protection against the unexpected.

A diversified portfolio might include:
• US stocks (domestic growth)
• International stocks (global exposure)
• Bonds (stability during crashes)
• Real estate funds (inflation protection)

When US stocks drop, international might rise. When stocks crash, bonds often hold steady. No single event can devastate your entire portfolio.

The simplest approach: a target-date fund or a 3-fund portfolio (US stocks, international stocks, bonds). One decision, instant diversification.`,
    keyTakeaway: 'Spread your investments across asset types so no single event can devastate you.'
  },
  {
    id: 'volatility_normal',
    title: 'Volatility is Normal (Not Scary)',
    duration: '5 min read',
    content: `Markets go up and down. This isn't a bug—it's a feature. Volatility is the price of admission for higher returns.

Historical context:
• The market drops 10% about once per year (normal)
• It drops 20% about every 3-4 years (also normal)
• It drops 30%+ about every decade (still normal)

And yet, despite ALL these drops, the market has returned about 10% per year on average over the last 100 years.

The investors who lose money are the ones who panic and sell during drops. The ones who build wealth stay invested through the turbulence.

Think of it like a flight: turbulence feels scary, but it's normal and the plane will land safely. Same with your investments.`,
    keyTakeaway: 'Short-term drops are the admission price for long-term gains. Stay the course.',
    hasInteractive: true
  },
  {
    id: 'asset_allocation',
    title: 'Asset Allocation by Age',
    duration: '4 min read',
    content: `Your investment mix should change as you age. When young, you can afford more risk (stocks). As you near retirement, you need more stability (bonds).

A simple rule: subtract your age from 110 to get your stock percentage.
• Age 30: 80% stocks, 20% bonds
• Age 50: 60% stocks, 40% bonds
• Age 65: 45% stocks, 55% bonds

Why? At 30, a market crash gives you decades to recover. At 65, you need that money soon—you can't afford to wait for recovery.

Target-date funds do this automatically. Pick the fund matching your retirement year, and it rebalances for you over time.`,
    keyTakeaway: 'Young = more stocks (growth). Older = more bonds (stability). Target-date funds automate this.'
  },
  {
    id: 'dca_strategy',
    title: 'Dollar-Cost Averaging',
    duration: '3 min read',
    content: `Dollar-cost averaging (DCA) means investing a fixed amount regularly, regardless of market conditions.

Instead of trying to time the market (buy low, sell high—which nobody can do consistently), you buy on a schedule:
• $500/month on the 1st
• Every month, no matter what the market does

When prices are high, your $500 buys fewer shares. When prices are low, you buy more shares. Over time, this averages out to a reasonable price.

The real benefit: DCA removes emotion from investing. You don't have to decide IF today is a good day to invest. You invest on schedule.`,
    keyTakeaway: 'Invest the same amount every month. Remove emotion, remove timing, build wealth automatically.'
  },
  {
    id: 'rebalancing',
    title: 'Rebalancing Your Portfolio',
    duration: '3 min read',
    content: `Over time, your portfolio drifts. If stocks have a great year, they might grow from 80% to 90% of your portfolio. Now you're taking more risk than planned.

Rebalancing means selling some of what grew and buying more of what didn't—returning to your target allocation.

How often? Once or twice per year is plenty. Some people rebalance on their birthday. Others when allocation drifts more than 5%.

Target-date funds rebalance automatically. If you use one, you don't need to think about this at all.`,
    keyTakeaway: 'Rebalance once a year to maintain your target risk level. Target-date funds do this for you.'
  }
];

export default EDUCATION_MODULES;
