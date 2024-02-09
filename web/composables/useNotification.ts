import { watch } from 'vue';
import type { Events } from '~/server/utils/sse';

export default function () {
  const { notify, close } = useToast();

  const session = useUserSession();
  const i18n = useI18n();
  const localePath = useLocalePath();
  const router = useRouter();

  let evtSource: EventSource;

  let interval: ReturnType<typeof setInterval> | undefined;

  const reconnect = () => {
    evtSource?.close();
    evtSource = new EventSource('/api/sse', {
      withCredentials: true
    });

    subscribe();
  };
  function subscribe() {
    evtSource.onerror = reconnect;
    evtSource.addEventListener('notify', (event: MessageEvent<string>) => {
      const { title, message, color, link } = JSON.parse(
        event.data
      ) as Events['notify'];
      const toastId = notify({
        title: i18n.te(title) ? i18n.t(title) : title,
        message: i18n.te(message) ? i18n.t(message) : message,
        color,
        onClick: link
          ? async () => {
              close(toastId || '');
              await router.push(localePath(link));
            }
          : undefined
      });
    });
  }

  onMounted(reconnect);

  onUnmounted(() => {
    evtSource?.close();
    clearInterval(interval);
  });
  watch(session.user, reconnect);
}
