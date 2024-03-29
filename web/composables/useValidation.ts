import type {
  DateInputDate,
  DateInputModelValue,
  DateInputRange
} from 'vuestic-ui/dist/types/components/va-date-input/types';

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
    },
    dateRangeIsPast() {
      return (model: DateInputModelValue) =>
        (model && isRangeModel(model) && model.start && model.end
          ? new Date(model.start).getTime() < Date.now() &&
            new Date(model.end).getTime() < Date.now()
          : true) || t('validation.date_range_past');
    },
    dateIsPast() {
      return (model: DateInputModelValue) =>
        (model &&
          isDateModel(model) &&
          new Date(model).getTime() < Date.now()) ||
        t('validation.date_range_past');
    },
    numeric(name: string) {
      return (value: string) =>
        (value &&
          !isNaN(parseFloat(value)) &&
          value?.split(' ').length === 1) ||
        t('validation.numeric', { name });
    },
    numericOptional(name: string) {
      return (value: string | undefined) =>
        !value ||
        (!isNaN(parseFloat(value)) && value?.split(' ').length === 1) ||
        t('validation.numeric', { name });
    }
  } as const;
}

function isRangeModel(
  model: DateInputModelValue
): model is DateInputRange<DateInputDate> {
  return (
    !!model &&
    typeof model === 'object' &&
    (model as DateInputRange<any>)?.end !== undefined &&
    (model as DateInputRange<any>)?.start !== undefined
  );
}

function isDateModel(model: DateInputModelValue): model is DateInputDate {
  return !!model && !isNaN(new Date(model as any).getTime());
}
