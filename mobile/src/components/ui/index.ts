/**
 * UI Components
 *
 * Core design system components for Dynastia.
 * All components follow the "Sanctuary Finance" design language.
 */

// Core Components
export { Button } from './Button';
export { Card, MetricCard } from './Card';
export { Input } from './Input';
export { MoneyText, MoneyWithLabel } from './MoneyText';
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonListItem,
  SkeletonBudgetCard,
  SkeletonGroup,
} from './Skeleton';

// Re-export default as named for flexibility
export { default as ButtonComponent } from './Button';
export { default as CardComponent } from './Card';
export { default as InputComponent } from './Input';
export { default as MoneyTextComponent } from './MoneyText';
export { default as SkeletonComponent } from './Skeleton';
