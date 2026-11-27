import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Icon, List, ProgressBar, RadioButton, Text, useTheme } from 'react-native-paper';
import {
  ANSWER_OPTIONS,
  ASSESSMENTS,
  HELPLINES,
  bandFor,
  getAssessment,
  needsSafetyMessage,
  score,
  type Assessment,
} from '../assessments';
import { getArea } from '../areas';
import { useProfile } from '../ProfileContext';
import { addResult, loadResults, type AssessmentResult } from '../storage';

type Step =
  | { kind: 'list' }
  | { kind: 'taking'; assessment: Assessment; index: number; answers: (number | null)[] }
  | { kind: 'result'; result: AssessmentResult };

export default function SelfCheckScreen() {
  const theme = useTheme();
  const [view, setView] = useState<Step>({ kind: 'list' });
  const [past, setPast] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    loadResults().then(setPast);
  }, []);

  const start = (assessment: Assessment) =>
    setView({ kind: 'taking', assessment, index: 0, answers: assessment.questions.map(() => null) });

  const finish = async (assessment: Assessment, answers: number[]) => {
    const result: AssessmentResult = {
      id: `${Date.now()}`,
      assessment: assessment.id,
      answers,
      total: score(answers),
      takenAt: new Date().toISOString(),
    };
    setPast(await addResult(result));
    setView({ kind: 'result', result });
  };

  const back = () => setView({ kind: 'list' });

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        {view.kind !== 'list' && <Appbar.BackAction onPress={back} accessibilityLabel="Back" />}
        <Appbar.Content title={view.kind === 'taking' ? view.assessment.name : view.kind === 'result' ? 'Your results' : 'Improve'} />
      </Appbar.Header>
      {view.kind === 'list' && <ListView onStart={start} past={past} onOpen={(result) => setView({ kind: 'result', result })} />}
      {view.kind === 'taking' && (
        <QuestionView
          view={view}
          onChange={(answers, index) => setView({ ...view, answers, index })}
          onFinish={(answers) => finish(view.assessment, answers)}
        />
      )}
      {view.kind === 'result' && <ResultView result={view.result} onDone={back} />}
    </View>
  );
}

function Disclaimer() {
  const theme = useTheme();
  return (
    <Card mode="contained" style={{ backgroundColor: theme.colors.secondaryContainer }}>
      <Card.Content style={styles.row}>
        <Icon source="information-outline" size={20} color={theme.colors.onSecondaryContainer} />
        <Text variant="bodySmall" style={[styles.flex, { color: theme.colors.onSecondaryContainer }]}>
          These checks are a way to reflect on how you have been. They are not a diagnosis. Only a qualified
          professional can diagnose a mental health condition.
        </Text>
      </Card.Content>
    </Card>
  );
}

function ListView({
  onStart,
  past,
  onOpen,
}: {
  onStart: (a: Assessment) => void;
  past: AssessmentResult[];
  onOpen: (r: AssessmentResult) => void;
}) {
  const theme = useTheme();
  const { profile, startEditing } = useProfile();
  const focus = (profile?.focusAreas ?? []).map(getArea);
  const suggestedIds = new Set(focus.map((a) => a.assessment).filter(Boolean));
  const suggested = ASSESSMENTS.filter((a) => suggestedIds.has(a.id));
  const others = ASSESSMENTS.filter((a) => !suggestedIds.has(a.id));

  const testCard = (a: Assessment) => (
    <Card key={a.id} mode="elevated" testID={`start-${a.id}`} onPress={() => onStart(a)}>
      <Card.Title title={a.name} subtitle={a.description} subtitleNumberOfLines={2} />
      <Card.Actions>
        <Button mode="contained-tonal" onPress={() => onStart(a)}>
          Start
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text variant="titleMedium">Your focus</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {focus.map((a) => a.label).join(', ') || 'Nothing picked yet'}
          </Text>
        </View>
        <Button icon="pencil-outline" onPress={startEditing} testID="edit-focus">
          Change
        </Button>
      </View>

      {focus.map((area) => (
        <Card key={area.id} mode="contained" testID={`tips-${area.id}`}>
          <Card.Title
            title={`${area.label}: things to try`}
            left={(props) => <Icon {...props} source={area.icon} color={theme.colors.primary} />}
          />
          <Card.Content style={styles.gap}>
            {area.tips.map((t) => (
              <View key={t} style={styles.row}>
                <Icon source="circle-small" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.flex}>
                  {t}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      ))}

      <Disclaimer />
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        All self-checks are optional. Take one only if you want to.
      </Text>

      {suggested.length > 0 && (
        <>
          <Text variant="titleMedium">Suggested for you</Text>
          {suggested.map(testCard)}
        </>
      )}
      {others.length > 0 && (
        <>
          <Text variant="titleMedium">{suggested.length > 0 ? 'Other checks' : 'Self-checks'}</Text>
          {others.map(testCard)}
        </>
      )}

      {past.length > 0 && (
        <List.Section>
          <List.Subheader>Past results</List.Subheader>
          {past.map((r) => {
            const a = getAssessment(r.assessment);
            return (
              <List.Item
                key={r.id}
                title={bandFor(a, r.total).title}
                description={`${a.shortName} · ${new Date(r.takenAt).toLocaleDateString()}`}
                left={(props) => <List.Icon {...props} icon="clipboard-text-outline" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => onOpen(r)}
              />
            );
          })}
        </List.Section>
      )}
    </ScrollView>
  );
}

function QuestionView({
  view,
  onChange,
  onFinish,
}: {
  view: Extract<Step, { kind: 'taking' }>;
  onChange: (answers: (number | null)[], index: number) => void;
  onFinish: (answers: number[]) => void;
}) {
  const { assessment, index, answers } = view;
  const total = assessment.questions.length;
  const current = answers[index];
  const isLast = index === total - 1;

  const choose = (value: number) => {
    const next = [...answers];
    next[index] = value;
    onChange(next, index);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="labelLarge">
        Question {index + 1} of {total}
      </Text>
      <ProgressBar progress={(index + 1) / total} />
      <Text variant="bodyMedium" style={styles.prompt}>
        {assessment.prompt}
      </Text>
      <Text variant="titleLarge">{assessment.questions[index]}</Text>
      <RadioButton.Group onValueChange={(v) => choose(Number(v))} value={current === null ? '' : String(current)}>
        {ANSWER_OPTIONS.map((o) => (
          <RadioButton.Item key={o.value} label={o.label} value={String(o.value)} testID={`answer-${o.value}`} />
        ))}
      </RadioButton.Group>
      <View style={styles.actions}>
        <Button disabled={index === 0} onPress={() => onChange(answers, index - 1)}>
          Previous
        </Button>
        <Button
          mode="contained"
          disabled={current === null}
          testID="next-button"
          onPress={() => (isLast ? onFinish(answers as number[]) : onChange(answers, index + 1))}
        >
          {isLast ? 'See results' : 'Next'}
        </Button>
      </View>
    </ScrollView>
  );
}

function ResultView({ result, onDone }: { result: AssessmentResult; onDone: () => void }) {
  const theme = useTheme();
  const assessment = getAssessment(result.assessment);
  const band = bandFor(assessment, result.total);
  const max = assessment.questions.length * 3;
  const safety = needsSafetyMessage(assessment, result.answers);
  const urgent = safety || band.severity === 'severe' || band.severity === 'moderately-severe';

  return (
    <ScrollView contentContainerStyle={styles.content} testID="result-view">
      {safety && (
        <Card mode="contained" style={{ backgroundColor: theme.colors.errorContainer }} testID="safety-card">
          <Card.Content style={styles.gap}>
            <Text variant="titleMedium" style={{ color: theme.colors.onErrorContainer }}>
              You mentioned thoughts of hurting yourself
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
              Please reach out to someone now. You do not have to go through this alone, and talking to someone can
              help. If you are in immediate danger, call emergency services.
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card mode="elevated">
        <Card.Content style={styles.gap}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            {assessment.name}
          </Text>
          <Text variant="headlineSmall">{band.title}</Text>
          <Text variant="bodyMedium">{band.meaning}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Score {result.total} of {max} · {new Date(result.takenAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Title title="What you can do" />
        <Card.Content style={styles.gap}>
          {band.steps.map((s) => (
            <View key={s} style={styles.row}>
              <Icon source="check-circle-outline" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.flex}>
                {s}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card mode={urgent ? 'contained' : 'outlined'}>
        <Card.Title title="Need to talk to someone?" />
        <Card.Content>
          {HELPLINES.map((h) => (
            <List.Item
              key={h.phone}
              title={h.name}
              description={h.phone}
              left={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => Linking.openURL(`tel:${h.phone}`)}
            />
          ))}
        </Card.Content>
      </Card>

      <Disclaimer />
      <Button mode="contained" onPress={onDone} style={styles.done}>
        Done
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  gap: { gap: 8 },
  prompt: { marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  done: { alignSelf: 'flex-end' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
