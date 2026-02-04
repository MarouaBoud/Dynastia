/**
 * InterestEducation
 *
 * Neutral, educational component explaining credit card interest costs.
 * Non-judgmental, focused on information.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/currency';

interface InterestEducationProps {
  balance: number;
  apr: number;
  monthlyPayment?: number;
}

export function InterestEducation({
  balance,
  apr,
  monthlyPayment,
}: InterestEducationProps) {
  const colors = useColors();

  // Calculate monthly interest
  const monthlyInterest = Math.round((balance * (apr / 100)) / 12);

  // Calculate payoff timeline and total interest if monthly payment provided
  let monthsToPayoff = 0;
  let totalInterest = 0;

  if (monthlyPayment && monthlyPayment > monthlyInterest) {
    let remainingBalance = balance;
    const monthlyRate = apr / 100 / 12;

    while (remainingBalance > 0 && monthsToPayoff < 120) {
      const interest = Math.round(remainingBalance * monthlyRate);
      const principal = Math.min(monthlyPayment - interest, remainingBalance);
      remainingBalance -= principal;
      totalInterest += interest;
      monthsToPayoff++;
    }
  }

  // Calculate yearly interest if paid in full
  const yearlyInterestSaved = monthlyInterest * 12;

  return (
    <Card variant="flat" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>💡</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Understanding your interest
        </Text>
      </View>

      {/* Main cost explanation */}
      <Text style={[styles.mainText, { color: colors.textSecondary }]}>
        Carrying {formatCurrency(balance)} at {apr}% APR costs approximately{' '}
        <Text style={[styles.highlight, { color: colors.text }]}>
          {formatCurrency(monthlyInterest)}/month
        </Text>{' '}
        in interest.
      </Text>

      {/* Payoff timeline if monthly payment provided */}
      {monthlyPayment && monthsToPayoff > 0 && (
        <View style={[styles.infoRow, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
            At {formatCurrency(monthlyPayment)}/month
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            Paid off in {monthsToPayoff} months
          </Text>
          <Text style={[styles.infoSubtext, { color: colors.textMuted }]}>
            Total interest: {formatCurrency(totalInterest)}
          </Text>
        </View>
      )}

      {/* Savings if paid in full */}
      <View style={[styles.savingsRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.savingsText, { color: colors.success }]}>
          Paying in full saves {formatCurrency(yearlyInterestSaved)}/year
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  icon: {
    fontSize: 20,
    marginRight: tokens.spacing.sm,
  },
  title: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
  mainText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    lineHeight: 22,
    marginBottom: tokens.spacing.md,
  },
  highlight: {
    fontWeight: tokens.typography.weights.semibold,
  },
  infoRow: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    marginBottom: tokens.spacing.md,
  },
  infoLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.xxs,
  },
  infoValue: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.xxs,
  },
  infoSubtext: {
    fontSize: tokens.typography.sizes.caption.fontSize,
  },
  savingsRow: {
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
  },
  savingsText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.medium,
    textAlign: 'center',
  },
});

export default InterestEducation;
