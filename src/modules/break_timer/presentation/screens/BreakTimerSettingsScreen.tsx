import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Button,
  NumberInput,
  TextInput,
  Stack,
  Text,
  Switch,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { useBreakTimer } from '../hooks/useBreakTimer';
import { updateBreakSettingsUseCase } from '../../domain/usecases/UpdateBreakSettingsUseCase';
import { getBreakSettingsUseCase } from '../../domain/usecases/GetBreakSettingsUseCase';
import { BreakSettings } from '../../data/models/BreakSettings';
import { notifications } from '@mantine/notifications';

export function BreakTimerSettingsScreen() {
  const navigate = useNavigate();
  const { updateBreakSettings, stopTimer } = useBreakTimer();
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);

  const form = useForm<BreakSettings>({
    initialValues: {
      id: 'default',
      breakInterval: 50,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getBreakSettingsUseCase.execute();
      form.setValues(settings);
      updateBreakSettings(settings);
    };
    loadSettings();
  }, [updateBreakSettings]);

  const handleSubmit = async (values: BreakSettings) => {
    await updateBreakSettingsUseCase.execute(values);
    updateBreakSettings(values);
    notifications.show({
      title: 'Settings Saved',
      message: 'Your break timer settings have been updated successfully.',
      color: 'green',
      autoClose: 3000,
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleToggleTimer = async (enabled: boolean) => {
    setIsTimerEnabled(enabled);
    if (!enabled) {
      stopTimer();
      notifications.show({
        title: 'Break Timer Disabled',
        message: 'Break timer has been disabled. No notifications will be shown.',
        color: 'red',
        autoClose: 3000,
      });
    } else {
      notifications.show({
        title: 'Break Timer Enabled',
        message: 'Break timer has been enabled. You will receive break reminders.',
        color: 'green',
        autoClose: 3000,
      });
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2} ta="center" mt="md" mb="xl">
          Break Timer Settings
        </Title>

        <Text c="dimmed" size="sm" mb="lg" ta="center">
          Get periodic break reminders during your working hours. A notification with an inspirational quote will be shown.
        </Text>

        <Paper 
          p="md" 
          withBorder 
          radius="md" 
          mb="lg" 
          bg={isTimerEnabled ? 'var(--mantine-color-green-filled)' : 'var(--mantine-color-red-filled)'}
        >
          <Group justify="space-between">
            <div>
              <Text fw={500} c="white">Break Timer Status</Text>
              <Text size="sm" c="white" style={{ opacity: 0.9 }}>
                {isTimerEnabled ? 'Currently active - You will receive break notifications' : 'Currently disabled - No notifications will be shown'}
              </Text>
            </div>
            <Switch
              checked={isTimerEnabled}
              onChange={(event) => handleToggleTimer(event.currentTarget.checked)}
              size="lg"
              color={isTimerEnabled ? 'green' : 'red'}
              label={isTimerEnabled ? 'ON' : 'OFF'}
              labelPosition="left"
            />
          </Group>
        </Paper>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <NumberInput
              label="Break Interval (minutes)"
              description="How often you should receive a break reminder (e.g., every 50 minutes of work)."
              placeholder="e.g., 50"
              min={1}
              disabled={!isTimerEnabled}
              {...form.getInputProps('breakInterval')}
            />

            <Title order={4} mt="md">Working Hours</Title>
            <TextInput
              label="Working Hours Start (HH:MM)"
              description="The start time of your typical workday. Breaks will only be suggested within these hours."
              placeholder="e.g., 09:00"
              disabled={!isTimerEnabled}
              {...form.getInputProps('workingHoursStart')}
            />
            <TextInput
              label="Working Hours End (HH:MM)"
              description="The end time of your typical workday. Breaks will only be suggested within these hours."
              placeholder="e.g., 17:00"
              disabled={!isTimerEnabled}
              {...form.getInputProps('workingHoursEnd')}
            />

            <Divider my="md" />

            <Group justify="space-between" mt="md">
              <Button variant="outline" color="gray" onClick={handleCancel}>
                Cancel
              </Button>
              <Group gap="xs">
                <Button type="submit" disabled={!isTimerEnabled}>
                  Save Settings
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
