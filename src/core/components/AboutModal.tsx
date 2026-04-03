import { Modal, Image, Text, Stack, Anchor, List, ListItem, Divider, Group } from '@mantine/core';
import logo from '../../img/appz-logo.png';
import appConfig from '../config/appConfig.json';

interface AboutModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AboutModal({ opened, onClose }: AboutModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="About AppZ" centered transitionProps={{ transition: 'pop' }} size="lg">

      <Group  align="center" wrap="nowrap" gap="sm">
        <Stack align="center" gap="sm" style={{ margin:4, flexGrow: 1 }}>
          <Image src={logo} h={60} w={60} fit="contain" alt="AppZ Logo" />
          <Text fw={700} size="xl">
            {appConfig.app.name}
          </Text>
          <Text c="dimmed" size="sm" ta="center">
            {appConfig.app.tagline}
          </Text>
        </Stack>

        <Divider orientation="vertical" h={150} />

        <Stack style={{ flexGrow: 1 }}>
          <List spacing="xs" size="sm">
            <ListItem>
              <Text span fw={500}>Version:</Text> {appConfig.version.current} (Build: {appConfig.version.buildDate})
            </ListItem>
            <ListItem>
              <Text span fw={500}>Application Message:</Text> {appConfig.app.message}
            </ListItem>
            <ListItem>
              <Text span fw={500}>Contact for feedback:</Text>{' '}
              <Anchor href={`mailto:${appConfig.app.feedbackEmail}`} size="sm">
                {appConfig.app.feedbackEmail}
              </Anchor>
            </ListItem>
          </List>
        </Stack>
      </Group>
    </Modal>
  );
}

