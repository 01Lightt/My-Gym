import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ColorPicker } from '@/components/ColorPicker';
import { RoutineCard } from '@/components/RoutineCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { WiiButton } from '@/components/WiiButton';
import { WiiInput } from '@/components/WiiInput';
import { WiiText } from '@/components/WiiText';
import {
  deleteRoutine,
  saveRoutine,
  suggestNextLabel,
  useRoutines,
  type Routine,
} from '@/data/routines';
import { spacing, type AccentName } from '@/theme';
import { confirmAction } from '@/utils/confirm';

/** Criar uma ficha nova ou editar uma existente (quando recebe ?id=). */
export default function FichaFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { routines, ready } = useRoutines();

  // Espera os dados carregarem para os campos já começarem preenchidos
  if (!ready) return <ScreenLayout title="Ficha" back="voltar">{null}</ScreenLayout>;
  return <FichaForm routines={routines} existing={routines.find((r) => r.id === id)} />;
}

function FichaForm({ routines, existing }: { routines: Routine[]; existing?: Routine }) {
  const [label, setLabel] = useState(existing?.label ?? suggestNextLabel(routines));
  const [name, setName] = useState(existing?.name ?? '');
  const [accent, setAccent] = useState<AccentName>(existing?.accent ?? 'blue');

  const canSave = label.trim().length > 0;

  const save = () => {
    const input = { label: label.trim().toUpperCase(), name: name.trim(), accent };
    if (existing) {
      saveRoutine(input, existing.id);
      router.back();
    } else {
      const newId = saveRoutine(input);
      router.replace({ pathname: '/fichas/[id]', params: { id: newId } });
    }
  };

  const remove = () => {
    if (!existing) return;
    confirmAction(
      'Excluir ficha?',
      `A ficha "${existing.name || existing.label}" e todos os exercícios dela serão apagados.`,
      'Excluir',
      () => {
        deleteRoutine(existing.id);
        router.dismissTo('/fichas');
      },
    );
  };

  return (
    <ScreenLayout title={existing ? 'Editar ficha' : 'Nova ficha'} back="voltar">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <WiiText variant="label" style={styles.previewLabel}>
          Prévia
        </WiiText>
        <RoutineCard routine={{ label, name, accent, exercises: existing?.exercises ?? [] }} />

        <View style={styles.row}>
          <WiiInput
            label="Letra"
            value={label}
            onChangeText={setLabel}
            maxLength={3}
            autoCapitalize="characters"
            style={styles.labelInput}
          />
          <View style={styles.flex}>
            <WiiInput
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Peito e tríceps"
            />
          </View>
        </View>

        <ColorPicker label="Cor" value={accent} onChange={setAccent} />

        <WiiButton label="Salvar" icon="checkmark" accent="green" onPress={save} disabled={!canSave} />
        {existing && (
          <WiiButton label="Excluir ficha" icon="trash" accent="red" variant="outline" onPress={remove} />
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.lg },
  previewLabel: { marginBottom: -spacing.md, marginLeft: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  labelInput: { width: 76, textAlign: 'center' },
  flex: { flex: 1 },
});
