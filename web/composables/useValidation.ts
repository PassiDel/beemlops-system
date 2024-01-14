export default function () {
  const { t } = useI18n();
  return {
    required(name: string) {
      return (value: string) =>
        (value && value.length > 0) || t('validation.required', { name });
    },
    max(name: string, max = 64) {
      return (value: string) =>
        (value && value.length <= max) ||
        t('validation.max_length', { name, max });
    },
    min(name: string, min = 8) {
      return (value: string) =>
        (value && value.length >= min) ||
        t('validation.min_length', { name, min });
    }
  } as const;
}
