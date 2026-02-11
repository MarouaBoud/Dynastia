/**
 * Money Blueprint Screen (Onboarding)
 *
 * The "Financial Soul Reading" that replaces generic onboarding.
 * Guided flow to establish:
 * 1. Geographic Context (EU vs US)
 * 2. Emotional Pulse (Anxiety vs Readiness)
 * 3. Financial Reality (Income vs Fixed Costs)
 * 4. The Blueprint Reveal (The plan)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/users.service';
import { tokens } from '../../theme/tokens';

const { width } = Dimensions.get('window');

type Step = 'welcome' | 'context' | 'pulse' | 'reality' | 'reveal';

export default function MoneyBlueprintScreen() {
    const colors = useColors();
    const navigation = useNavigation();
    const { setUser } = useAuth();

    const [step, setStep] = useState<Step>('welcome');
    const [direction, setDirection] = useState<'next' | 'back'>('next');

    // Data State
    const [region, setRegion] = useState<'EU' | 'US' | null>(null);
    const [pulse, setPulse] = useState<'anxious' | 'foggy' | 'ready' | null>(null);
    const [income, setIncome] = useState('');
    const [fixedCosts, setFixedCosts] = useState('');

    // Animation
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Constants
    const FREEDOM_NUMBER = (parseInt(income) || 0) - (parseInt(fixedCosts) || 0);

    const transitionTo = (nextStep: Step) => {
        setDirection('next');
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            setStep(nextStep);
            slideAnim.setValue(50);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        });
    };

    const handleFinish = async () => {
        try {
            // Save profile data
            const updatedUser = await updateProfile({
                country: region === 'US' ? 'US' : 'FR', // Default to FR for EU for now, logic can be smarter
                currency: region === 'US' ? 'USD' : 'EUR',
                // In a real app, we'd save the pulse and numbers to a "FinancialProfile" table
            });
            setUser(updatedUser);
            navigation.navigate('Home' as never);
        } catch (error) {
            console.error('Failed to save blueprint', error);
        }
    };

    // ---------------------------------------------------------------------------
    // STEP 1: WELCOME
    // ---------------------------------------------------------------------------
    const renderWelcome = () => (
        <View style={styles.stepContainer}>
            <View style={styles.iconCircle}>
                <Feather name="sun" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Home.</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Let's leave the stress behind and build your personal financial sovereignty.
                {'\n\n'}
                No judgment. Just clarity.
            </Text>
            <Button label="Start My Blueprint" onPress={() => transitionTo('context')} />
        </View>
    );

    // ---------------------------------------------------------------------------
    // STEP 2: CONTEXT (The Engine)
    // ---------------------------------------------------------------------------
    const renderContext = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepLabel, { color: colors.primary }]}>STEP 1 OF 3</Text>
            <Text style={[styles.title, { color: colors.text }]}>Where is your empire based?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                This helps us tailor the legal and tax advice to your location.
            </Text>

            <View style={styles.choiceContainer}>
                <ChoiceCard
                    label="Europe (EU)"
                    icon="globe"
                    selected={region === 'EU'}
                    onPress={() => setRegion('EU')}
                    colors={colors}
                />
                <ChoiceCard
                    label="United States"
                    icon="flag"
                    selected={region === 'US'}
                    onPress={() => setRegion('US')}
                    colors={colors}
                />
            </View>

            <Button
                label="Next"
                disabled={!region}
                onPress={() => transitionTo('pulse')}
            />
        </View>
    );

    // ---------------------------------------------------------------------------
    // STEP 3: PULSE (The Emotion)
    // ---------------------------------------------------------------------------
    const renderPulse = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepLabel, { color: colors.primary }]}>STEP 2 OF 3</Text>
            <Text style={[styles.title, { color: colors.text }]}>How does money feel right now?</Text>

            <View style={styles.choiceContainer}>
                <ChoiceCard
                    label="Anxious"
                    subLabel="I avoid looking at it."
                    icon="frown"
                    selected={pulse === 'anxious'}
                    onPress={() => setPulse('anxious')}
                    colors={colors}
                />
                <ChoiceCard
                    label="Foggy"
                    subLabel="It comes and goes."
                    icon="cloud"
                    selected={pulse === 'foggy'}
                    onPress={() => setPulse('foggy')}
                    colors={colors}
                />
                <ChoiceCard
                    label="Ready"
                    subLabel="I want to grow."
                    icon="zap"
                    selected={pulse === 'ready'}
                    onPress={() => setPulse('ready')}
                    colors={colors}
                />
            </View>

            <Button
                label="Next"
                disabled={!pulse}
                onPress={() => transitionTo('reality')}
            />
        </View>
    );

    // ---------------------------------------------------------------------------
    // STEP 4: REALITY (The Numbers)
    // ---------------------------------------------------------------------------
    const renderReality = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepLabel, { color: colors.primary }]}>STEP 3 OF 3</Text>
            <Text style={[styles.title, { color: colors.text }]}>Let's find your baseline.</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Rough estimates are fine. We can refine later.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Monthly Income</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                    placeholder="e.g. 3000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={income}
                    onChangeText={setIncome}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Fixed Costs (Bills/Rent)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                    placeholder="e.g. 1500"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={fixedCosts}
                    onChangeText={setFixedCosts}
                />
            </View>

            <Button
                label="Reveal My Blueprint"
                disabled={!income || !fixedCosts}
                onPress={() => transitionTo('reveal')}
            />
        </View>
    );

    // ---------------------------------------------------------------------------
    // STEP 5: REVEAL (The Blueprint)
    // ---------------------------------------------------------------------------
    const renderReveal = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', paddingBottom: 40 }}>
                <Text style={[styles.stepLabel, { color: colors.success }]}>BLUEPRINT GENERATED</Text>
                <Text style={[styles.title, { color: colors.text }]}>Your Freedom Number</Text>

                <View style={styles.freedomCard}>
                    <Text style={[styles.freedomAmount, { color: colors.primary }]}>
                        {region === 'US' ? '$' : '€'}{FREEDOM_NUMBER}
                    </Text>
                    <Text style={[styles.freedomLabel, { color: colors.textSecondary }]}>
                        Monthly Free Cash Flow
                    </Text>
                </View>

                <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 24 }]}>
                    This is your building block. Here is your personalized plan:
                </Text>

                {/* The Stations */}
                <BlueprintStep
                    number="1"
                    title="Safety Net"
                    status="Next Step"
                    desc="Build a €1,000 buffer to stop the anxiety loop."
                    active
                    colors={colors}
                />
                <View style={[styles.connector, { backgroundColor: colors.border }]} />
                <BlueprintStep
                    number="2"
                    title="Runway"
                    status="Locked"
                    desc="3 months of expenses for pure peace of mind."
                    colors={colors}
                />
                <View style={[styles.connector, { backgroundColor: colors.border }]} />
                <BlueprintStep
                    number="3"
                    title="Wealth Engine"
                    status="Locked"
                    desc={region === 'US' ? "Roth IRA & Automated Index Funds." : "PEA & Automated ETFs."}
                    colors={colors}
                />

                <View style={{ height: 32 }} />
                <Button label="Let's Build It" onPress={handleFinish} />
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateX: slideAnim }],
                        },
                    ]}
                >
                    {step === 'welcome' && renderWelcome()}
                    {step === 'context' && renderContext()}
                    {step === 'pulse' && renderPulse()}
                    {step === 'reality' && renderReality()}
                    {step === 'reveal' && renderReveal()}
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// -----------------------------------------------------------------------------
// SUB-COMPONENTS
// -----------------------------------------------------------------------------

const ChoiceCard = ({ label, subLabel, icon, selected, onPress, colors }: any) => (
    <TouchableOpacity
        style={[
            styles.choiceCard,
            {
                backgroundColor: selected ? colors.primary + '15' : colors.card,
                borderColor: selected ? colors.primary : 'transparent',
            }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <Feather
            name={icon}
            size={24}
            color={selected ? colors.primary : colors.textSecondary}
            style={{ marginRight: 16 }}
        />
        <View style={{ flex: 1 }}>
            <Text style={[styles.choiceLabel, { color: selected ? colors.primary : colors.text }]}>
                {label}
            </Text>
            {subLabel && (
                <Text style={[styles.choiceSubLabel, { color: colors.textSecondary }]}>
                    {subLabel}
                </Text>
            )}
        </View>
        {selected && <Feather name="check" size={20} color={colors.primary} />}
    </TouchableOpacity>
);

const Button = ({ label, disabled, onPress }: any) => {
    const colors = useColors();
    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: disabled ? colors.border : colors.primary }
            ]}
            disabled={disabled}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
    );
};

const BlueprintStep = ({ number, title, status, desc, active, colors }: any) => (
    <View style={[styles.blueprintCard, { backgroundColor: active ? colors.card : colors.background }]}>
        <View style={[styles.stepNumber, { backgroundColor: active ? colors.primary : colors.border }]}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{number}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.blueprintTitle, { color: active ? colors.text : colors.textSecondary }]}>
                    {title}
                </Text>
                <Text style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: active ? colors.success : colors.textSecondary,
                    textTransform: 'uppercase',
                    marginTop: 4
                }}>
                    {status}
                </Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{desc}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 17,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 40,
    },
    stepLabel: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    choiceContainer: {
        marginBottom: 40,
        width: '100%',
    },
    choiceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 2,
    },
    choiceLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    choiceSubLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    inputContainer: {
        marginBottom: 24,
        width: '100%',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        padding: 16,
        borderRadius: 16,
        fontSize: 20,
        fontWeight: '500',
    },
    button: {
        paddingVertical: 20,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    // Reveal Styles
    freedomCard: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    freedomAmount: {
        fontSize: 56,
        fontWeight: '800',
        marginBottom: 8,
    },
    freedomLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    blueprintCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    blueprintTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    connector: {
        width: 2,
        height: 24,
        marginVertical: 4,
        marginLeft: 35, // Align with center of circle (20 padding + 16 center of 32 width)
        alignSelf: 'flex-start',
    },
});
