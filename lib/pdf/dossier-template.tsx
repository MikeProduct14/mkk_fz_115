import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { registerFonts } from './fonts'

registerFonts()

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    color: '#1a1a1a',
  },
  // Шапка
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  headerMetaText: {
    fontSize: 9,
    color: '#6b7280',
  },
  // Секция
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1e40af',
  },
  // Поля
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fieldFull: {
    width: '100%',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  fieldHalf: {
    width: '50%',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  fieldLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1,
    fontWeight: 400,
  },
  fieldValue: {
    fontSize: 10,
    fontWeight: 500,
    color: '#111827',
  },
  fieldEmpty: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  // Статус
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    borderRadius: 4,
  },
  statusApproved: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  statusRejected: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  statusDraft: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginRight: 6,
  },
  statusValueApproved: {
    fontSize: 11,
    fontWeight: 700,
    color: '#15803d',
  },
  statusValueRejected: {
    fontSize: 11,
    fontWeight: 700,
    color: '#dc2626',
  },
  statusValueDraft: {
    fontSize: 11,
    fontWeight: 500,
    color: '#374151',
  },
  // Риск
  riskBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 8,
  },
  riskLow: { backgroundColor: '#dcfce7' },
  riskMedium: { backgroundColor: '#fef9c3' },
  riskHigh: { backgroundColor: '#fee2e2' },
  riskLowText: { fontSize: 10, fontWeight: 700, color: '#15803d' },
  riskMediumText: { fontSize: 10, fontWeight: 700, color: '#a16207' },
  riskHighText: { fontSize: 10, fontWeight: 700, color: '#dc2626' },
  // Проверки
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  checkClear: { backgroundColor: '#f0fdf4' },
  checkFound: { backgroundColor: '#fef2f2' },
  checkManual: { backgroundColor: '#fffbeb' },
  checkIcon: {
    width: 16,
    marginRight: 8,
    fontSize: 10,
    fontWeight: 700,
  },
  checkIconClear: { color: '#15803d' },
  checkIconFound: { color: '#dc2626' },
  checkIconManual: { color: '#d97706' },
  checkName: {
    flex: 1,
    fontSize: 10,
    fontWeight: 500,
  },
  checkResult: {
    fontSize: 9,
    marginLeft: 8,
  },
  checkResultClear: { color: '#15803d' },
  checkResultFound: { color: '#dc2626', fontWeight: 700 },
  checkResultManual: { color: '#d97706' },
  checkDate: {
    fontSize: 8,
    color: '#9ca3af',
    marginLeft: 8,
  },
  // ПЭП предупреждение
  pepWarning: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  pepWarningText: {
    fontSize: 9,
    color: '#92400e',
    fontWeight: 500,
  },
  // Подпись
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  signatureBlock: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 4,
    width: '45%',
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
  },
})

// Типы данных
interface Check {
  id: string
  check_type: 'rfm' | 'passport'
  result: 'clear' | 'found' | 'error' | 'manual_required'
  checked_at: string
}

interface Client {
  id: string
  last_name: string
  first_name: string
  middle_name: string | null
  birthday: string | null
  citizenship: string | null
  passport_series: string | null
  passport_number: string | null
  passport_issued_by: string | null
  passport_issued_date: string | null
  passport_division_code: string | null
  reg_address: string | null
  live_address: string | null
  snils: string | null
  inn: string | null
  loan_purpose: string | null
  income_source: string | null
  is_pep: boolean
  pep_description: string | null
  risk_level: 'low' | 'medium' | 'high'
  risk_reason: string | null
  status: string
  reject_reason: string | null
  created_at: string
  updated_at: string
}

interface Organization {
  name: string
  inn: string
  org_type: string
  sdl_name: string | null
  sdl_position: string | null
}

interface DossierProps {
  client: Client
  checks: Check[]
  organization: Organization
}

// Утилиты форматирования
function fmt(v: string | null | undefined) {
  return v || '—'
}

function fmtDate(v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('ru-RU')
}

function fmtDateTime(v: string) {
  return new Date(v).toLocaleString('ru-RU')
}

const STATUS_LABELS: Record<string, string> = {
  approved: 'Одобрен',
  rejected: 'Отказ',
  checking: 'На проверке',
  draft: 'Черновик',
}

const RISK_LABELS: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

const CHECK_LABELS: Record<string, string> = {
  rfm: 'Перечень Росфинмониторинга (РФМ)',
  passport: 'Действительность паспорта (МВД)',
}

const RESULT_LABELS: Record<string, string> = {
  clear: 'Не найден',
  found: 'НАЙДЕН — выдача запрещена',
  error: 'Требует ручной проверки',
  manual_required: 'Требует ручной проверки',
}

// Компонент поля
function Field({ label, value, full }: { label: string; value: string | null | undefined; full?: boolean }) {
  const style = full ? styles.fieldFull : styles.fieldHalf
  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {value ? (
        <Text style={styles.fieldValue}>{value}</Text>
      ) : (
        <Text style={styles.fieldEmpty}>не указано</Text>
      )}
    </View>
  )
}

// Основной компонент документа
export function DossierDocument({ client, checks, organization }: DossierProps) {
  const fio = [client.last_name, client.first_name, client.middle_name].filter(Boolean).join(' ')
  const generatedAt = new Date().toLocaleString('ru-RU')
  const isApproved = client.status === 'approved'
  const isRejected = client.status === 'rejected'

  const latestRfm = checks.find((c) => c.check_type === 'rfm')
  const latestPassport = checks.find((c) => c.check_type === 'passport')
  const relevantChecks = [latestRfm, latestPassport].filter(Boolean) as Check[]

  return (
    <Document
      title={`Досье клиента — ${fio}`}
      author={organization.name}
      subject="Идентификация клиента по ФЗ-115"
      creator="Compliance MFO"
    >
      <Page size="A4" style={styles.page}>

        {/* Шапка */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Досье клиента</Text>
          <Text style={styles.headerSubtitle}>
            Идентификация клиента в соответствии с требованиями Федерального закона № 115-ФЗ
          </Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaText}>
              Организация: {organization.name} (ИНН {organization.inn})
            </Text>
            <Text style={styles.headerMetaText}>
              Сформировано: {generatedAt}
            </Text>
          </View>
        </View>

        {/* Статус досье */}
        <View style={[
          styles.statusRow,
          isApproved ? styles.statusApproved : isRejected ? styles.statusRejected : styles.statusDraft,
        ]}>
          <Text style={styles.statusLabel}>Статус проверки:</Text>
          <Text style={
            isApproved ? styles.statusValueApproved
            : isRejected ? styles.statusValueRejected
            : styles.statusValueDraft
          }>
            {STATUS_LABELS[client.status] || client.status}
          </Text>
          <View style={[
            styles.riskBadge,
            client.risk_level === 'low' ? styles.riskLow
            : client.risk_level === 'medium' ? styles.riskMedium
            : styles.riskHigh,
          ]}>
            <Text style={
              client.risk_level === 'low' ? styles.riskLowText
              : client.risk_level === 'medium' ? styles.riskMediumText
              : styles.riskHighText
            }>
              Риск: {RISK_LABELS[client.risk_level]}
            </Text>
          </View>
          <Text style={[styles.headerMetaText, { marginLeft: 'auto' }]}>
            Создан: {fmtDate(client.created_at)}  Обновлён: {fmtDate(client.updated_at)}
          </Text>
        </View>

        {/* Личные данные */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Личные данные</Text>
          <View style={styles.grid}>
            <Field label="Фамилия" value={client.last_name} />
            <Field label="Имя" value={client.first_name} />
            <Field label="Отчество" value={client.middle_name} />
            <Field label="Дата рождения" value={fmtDate(client.birthday)} />
            <Field label="Гражданство" value={client.citizenship} />
          </View>
        </View>

        {/* Паспортные данные */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Паспортные данные</Text>
          <View style={styles.grid}>
            <Field label="Серия паспорта" value={client.passport_series} />
            <Field label="Номер паспорта" value={client.passport_number} />
            <Field label="Дата выдачи" value={fmtDate(client.passport_issued_date)} />
            <Field label="Код подразделения" value={client.passport_division_code} />
            <Field full label="Кем выдан" value={client.passport_issued_by} />
            <Field full label="Адрес регистрации" value={client.reg_address} />
            <Field full label="Адрес проживания" value={client.live_address ?? client.reg_address} />
            <Field label="СНИЛС" value={client.snils} />
            <Field label="ИНН" value={client.inn} />
          </View>
        </View>

        {/* Оценка риска */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Оценка риска</Text>

          {client.is_pep && (
            <View style={styles.pepWarning}>
              <Text style={styles.pepWarningText}>
                ⚠ ПУБЛИЧНО ЗНАЧИМОЕ ЛИЦО (ПЭП) — требуется углублённая проверка
              </Text>
              {client.pep_description && (
                <Text style={[styles.pepWarningText, { marginTop: 3, fontWeight: 400 }]}>
                  {client.pep_description}
                </Text>
              )}
            </View>
          )}

          <View style={styles.grid}>
            <Field label="Цель займа" value={client.loan_purpose} />
            <Field label="Источник дохода" value={client.income_source} />
            <Field label="Публично значимое лицо (ПЭП)" value={client.is_pep ? 'Да' : 'Нет'} />
            <Field label="Группа риска" value={RISK_LABELS[client.risk_level]} />
            {client.risk_reason && (
              <Field full label="Обоснование высокого риска" value={client.risk_reason} />
            )}
          </View>
        </View>

        {/* Результаты проверок */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Результаты автоматических проверок</Text>
          {relevantChecks.length === 0 ? (
            <View style={[styles.checkRow, styles.checkManual]}>
              <Text style={styles.fieldEmpty}>Автоматические проверки не проводились</Text>
            </View>
          ) : (
            relevantChecks.map((check) => {
              const isClear = check.result === 'clear'
              const isFound = check.result === 'found'
              return (
                <View
                  key={check.id}
                  style={[
                    styles.checkRow,
                    isClear ? styles.checkClear : isFound ? styles.checkFound : styles.checkManual,
                  ]}
                >
                  <Text style={[
                    styles.checkIcon,
                    isClear ? styles.checkIconClear : isFound ? styles.checkIconFound : styles.checkIconManual,
                  ]}>
                    {isClear ? '✓' : isFound ? '✗' : '!'}
                  </Text>
                  <Text style={styles.checkName}>{CHECK_LABELS[check.check_type] || check.check_type}</Text>
                  <Text style={[
                    styles.checkResult,
                    isClear ? styles.checkResultClear : isFound ? styles.checkResultFound : styles.checkResultManual,
                  ]}>
                    {RESULT_LABELS[check.result]}
                  </Text>
                  <Text style={styles.checkDate}>{fmtDateTime(check.checked_at)}</Text>
                </View>
              )
            })
          )}
        </View>

        {/* Блок подписи */}
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLine}>
            {organization.sdl_name || '______________________'}{'\n'}
            {organization.sdl_position || 'Ответственное должностное лицо'}
          </Text>
          <Text style={styles.signatureLine}>
            {'______________________'}{'\n'}
            Подпись / Дата
          </Text>
        </View>

        {/* Футер */}
        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Документ сформирован автоматически • Compliance MFO • ФЗ-115
            </Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
              `Стр. ${pageNumber} / ${totalPages}`
            } />
          </View>
        </View>

      </Page>
    </Document>
  )
}
